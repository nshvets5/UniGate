using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.Iam.Infrastructure.Outbox;
using UniGate.SharedKernel.Outbox;


namespace UniGate.Api.Outbox;

public sealed class OutboxProcessorHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<OutboxProcessorHostedService> _logger;
    private const int MaxAttempts = 10;

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
                var directoryDb = scope.ServiceProvider.GetRequiredService<DirectoryDbContext>();

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
                        await ProcessMessageAsync(msg, auditDb, directoryDb, stoppingToken);
                        await reader.MarkProcessedAsync(msg.Id, stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        if (msg.Attempts + 1 >= MaxAttempts)
                        {
                            await reader.MarkDeadLetterAsync(
                                msg.Id,
                                reason: $"Max attempts reached. Last error: {ex.Message}",
                                stoppingToken);

                            _logger.LogError(ex, "Dead-lettered outbox message {MessageId} type={Type}", msg.Id, msg.Type);
                        }
                        else
                        {
                            var delay = TimeSpan.FromSeconds(Math.Min(60, 2 + msg.Attempts * 5));
                            await reader.MarkFailedAsync(msg.Id, ex.Message, delay, stoppingToken);
                        }
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

    private static async Task ProcessMessageAsync(
        OutboxMessage msg,
        AuditDbContext auditDb,
        DirectoryDbContext directoryDb,
        CancellationToken ct)
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

            if (!string.IsNullOrWhiteSpace(email))
            {
                await TryAutoBindStudentProfileAsync(
                    directoryDb: directoryDb,
                    profileId: profileId,
                    email: email!,
                    actorProvider: provider,
                    actorSubject: subject,
                    correlationId: msg.CorrelationId,
                    traceId: msg.TraceId,
                    ct: ct);
            }

            return;
        }

        if (msg.Type is "directory.group_created" or "directory.group_updated" or "directory.group_active_changed")
        {
            using var doc = JsonDocument.Parse(msg.PayloadJson);
            var root = doc.RootElement;

            var groupId = root.GetProperty("groupId").GetGuid();
            var code = root.GetProperty("Code").GetString();
            var name = root.GetProperty("Name").GetString();
            var admissionYear = root.GetProperty("AdmissionYear").GetInt32();
            var isActive = root.GetProperty("IsActive").GetBoolean();

            var actorProvider = root.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
            var actorSubject = root.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;

            var exists = await auditDb.AuditEvents.AsNoTracking()
                .AnyAsync(x => x.SourceMessageId == msg.Id, ct);

            if (exists)
                return;

            auditDb.AuditEvents.Add(new UniGate.Audit.Domain.AuditEvent(
                type: msg.Type,
                actorProvider: actorProvider,
                actorSubject: actorSubject,
                actorProfileId: null,
                resourceType: "directory.group",
                resourceId: groupId.ToString(),
                correlationId: msg.CorrelationId,
                traceId: msg.TraceId,
                ip: null,
                userAgent: null,
                dataJson: JsonSerializer.Serialize(new { groupId, code, name, admissionYear, isActive }),
                sourceMessageId: msg.Id
            ));

            await auditDb.SaveChangesAsync(ct);
            return;
        }

        if (msg.Type.StartsWith("directory.student_", StringComparison.Ordinal))
        {
            using var doc = JsonDocument.Parse(msg.PayloadJson);
            var root = doc.RootElement;

            var studentId = root.GetProperty("studentId").GetGuid();
            var groupId = root.GetProperty("GroupId").GetGuid();

            var firstName = root.GetProperty("FirstName").GetString();
            var lastName = root.GetProperty("LastName").GetString();
            var email = root.GetProperty("Email").GetString();
            var isActive = root.GetProperty("IsActive").GetBoolean();

            var iamProfileId = root.TryGetProperty("IamProfileId", out var p) && p.ValueKind != JsonValueKind.Null
                ? p.GetGuid()
                : (Guid?)null;

            var actorProvider = root.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
            var actorSubject = root.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;

            var exists = await auditDb.AuditEvents.AsNoTracking()
                .AnyAsync(x => x.SourceMessageId == msg.Id, ct);

            if (exists)
                return;

            auditDb.AuditEvents.Add(new UniGate.Audit.Domain.AuditEvent(
                type: msg.Type,
                actorProvider: actorProvider,
                actorSubject: actorSubject,
                actorProfileId: null,
                resourceType: "directory.student",
                resourceId: studentId.ToString(),
                correlationId: msg.CorrelationId,
                traceId: msg.TraceId,
                ip: null,
                userAgent: null,
                dataJson: JsonSerializer.Serialize(new { studentId, groupId, firstName, lastName, email, isActive, iamProfileId }),
                sourceMessageId: msg.Id
            ));

            await auditDb.SaveChangesAsync(ct);
            return;
        }

        throw new InvalidOperationException($"Unsupported outbox message type: {msg.Type}");
    }

    private static async Task TryAutoBindStudentProfileAsync(
        DirectoryDbContext directoryDb,
        Guid profileId,
        string email,
        string? actorProvider,
        string? actorSubject,
        string? correlationId,
        string? traceId,
        CancellationToken ct)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var student = await directoryDb.Students
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, ct);

        if (student is null)
            return;

        if (student.IamProfileId == profileId)
            return;

        if (student.IamProfileId is not null && student.IamProfileId != profileId)
            return;

        student.BindIamProfile(profileId);

        var payload = System.Text.Json.JsonSerializer.Serialize(new
        {
            studentId = student.Id,
            student.GroupId,
            student.FirstName,
            student.LastName,
            student.MiddleName,
            student.Email,
            student.IamProfileId,
            student.IsActive,
            actorProvider,
            actorSubject,
            occurredAt = DateTimeOffset.UtcNow
        });

        directoryDb.OutboxMessages.Add(new UniGate.SharedKernel.Outbox.OutboxMessage(
            type: UniGate.SharedKernel.Outbox.DirectoryOutboxTypes.StudentProfileBound,
            payloadJson: payload,
            correlationId: correlationId,
            traceId: traceId));

        await directoryDb.SaveChangesAsync(ct);
    }
}
