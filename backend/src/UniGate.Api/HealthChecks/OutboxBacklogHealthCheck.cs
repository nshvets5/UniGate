using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using UniGate.Iam.Infrastructure.Persistence;

namespace UniGate.Api.HealthChecks;

public sealed class OutboxBacklogHealthCheck : IHealthCheck
{
    private readonly IamDbContext _db;

    public OutboxBacklogHealthCheck(IamDbContext db)
    {
        _db = db;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;

        var pendingQuery = _db.OutboxMessages.AsNoTracking()
            .Where(x => x.ProcessedAt == null && x.DeadLetteredAt == null);

        var pendingCount = await pendingQuery.LongCountAsync(cancellationToken);

        var oldestOccurredAt = await pendingQuery
            .OrderBy(x => x.OccurredAt)
            .Select(x => (DateTimeOffset?)x.OccurredAt)
            .FirstOrDefaultAsync(cancellationToken);

        var lagSeconds = oldestOccurredAt is null
            ? 0
            : (long)Math.Max(0, (now - oldestOccurredAt.Value).TotalSeconds);

        var status = lagSeconds > 300 ? HealthStatus.Degraded : HealthStatus.Healthy;

        return new HealthCheckResult(
            status,
            description: "Outbox backlog state",
            data: new Dictionary<string, object?>
            {
                ["pendingCount"] = pendingCount,
                ["oldestLagSeconds"] = lagSeconds
            });
    }
}