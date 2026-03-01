using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.Iam.Infrastructure.Outbox;

namespace UniGate.Api.Outbox;

public sealed class OutboxProcessorHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<OutboxProcessorHostedService> _logger;

    public OutboxProcessorHostedService(IServiceProvider sp, ILogger<OutboxProcessorHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var reader = scope.ServiceProvider.GetRequiredService<IOutboxReader>();
                var auditDb = scope.ServiceProvider.GetRequiredService<AuditDbContext>();

                var batch = await reader.DequeueBatchAsync(batchSize: 20, stoppingToken);

                if (batch.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
                    continue;
                }

                foreach (var msg in batch)
                {
                    if (stoppingToken.IsCancellationRequested) break;

                    try
                    {
                        await ProcessMessageAsync(msg, auditDb, stoppingToken);
                        await reader.MarkProcessedAsync(msg.Id, stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed processing outbox message {MessageId} type={Type}", msg.Id, msg.Type);

                        var delay = TimeSpan.FromSeconds(Math.Min(60, 2 + msg.Attempts * 5));
                        await reader.MarkFailedAsync(msg.Id, ex.Message, delay, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Outbox processor loop error");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private static async Task ProcessMessageAsync(OutboxMessage msg, AuditDbContext auditDb, CancellationToken ct)
    {
        if (msg.Type == "iam.user_profile_provisioned")
        {
            using var doc = JsonDocument.Parse(msg.PayloadJson);
            var root = doc.RootElement;

            var profileId = root.GetProperty("profileId").GetGuid();
            var provider = root.GetProperty("provider").GetString();
            var subject = root.GetProperty("subject").GetString();
            var email = root.TryGetProperty("email", out var em) ? em.GetString() : null;
            var displayName = root.TryGetProperty("displayName", out var dn) ? dn.GetString() : null;

            var exists = await auditDb.AuditEvents.AsNoTracking()
                .AnyAsync(x => x.SourceMessageId == msg.Id, ct);

            if (exists)
                return;

            auditDb.AuditEvents.Add(new UniGate.Audit.Domain.AuditEvent(
                type: "iam.user_profile_provisioned",
                actorProvider: provider,
                actorSubject: subject,
                actorProfileId: profileId,
                resourceType: "iam.user_profile",
                resourceId: profileId.ToString(),
                correlationId: msg.CorrelationId,
                traceId: msg.TraceId,
                ip: null,
                userAgent: null,
                dataJson: JsonSerializer.Serialize(new { email, displayName }),
                sourceMessageId: msg.Id
            ));

            await auditDb.SaveChangesAsync(ct);
            return;
        }

        throw new InvalidOperationException($"Unsupported outbox message type: {msg.Type}");
    }
}
