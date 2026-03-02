using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableSyncHealthCheck : IHealthCheck
{
    private readonly TimetableSyncStatusEvaluator _eval;

    public TimetableSyncHealthCheck(TimetableSyncStatusEvaluator eval)
    {
        _eval = eval;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var s = _eval.Evaluate();

        var data = new Dictionary<string, object?>
        {
            ["enabled"] = s.Enabled,
            ["intervalSeconds"] = s.IntervalSeconds,
            ["jitterSeconds"] = s.JitterSeconds,
            ["runOnStartup"] = s.RunOnStartup,
            ["lastRunUtc"] = s.LastRunUtc,
            ["lastSuccessUtc"] = s.LastSuccessUtc,
            ["lastUpdatedRulesCount"] = s.LastUpdatedRulesCount,
            ["lastError"] = s.LastError,
            ["ageSeconds"] = s.AgeSeconds,
            ["staleAfterSeconds"] = s.StaleAfterSeconds,
            ["isStale"] = s.IsStale
        };

        if (!s.Enabled)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Healthy,
                description: "Timetable auto-sync is disabled.",
                exception: null,
                data: data));
        }

        if (s.LastRunUtc is null)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Degraded,
                description: "Timetable auto-sync has not run yet.",
                exception: null,
                data: data));
        }

        if (s.LastSuccessUtc is null)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Unhealthy,
                description: "Timetable auto-sync has never succeeded.",
                exception: null,
                data: data));
        }

        if (s.IsStale)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Unhealthy,
                description: "Timetable auto-sync is stale.",
                exception: null,
                data: data));
        }

        if (!string.IsNullOrWhiteSpace(s.LastError))
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Degraded,
                description: "Timetable auto-sync has recent errors.",
                exception: null,
                data: data));
        }

        return Task.FromResult(new HealthCheckResult(
            status: HealthStatus.Healthy,
            description: "Timetable auto-sync is OK.",
            exception: null,
            data: data));
    }
}