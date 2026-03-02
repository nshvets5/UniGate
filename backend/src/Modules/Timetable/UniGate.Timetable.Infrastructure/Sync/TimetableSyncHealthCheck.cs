using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableSyncHealthCheck : IHealthCheck
{
    private readonly TimetableSyncStatus _status;
    private readonly IOptionsMonitor<TimetableSyncOptions> _options;

    public TimetableSyncHealthCheck(TimetableSyncStatus status, IOptionsMonitor<TimetableSyncOptions> options)
    {
        _status = status;
        _options = options;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var opt = _options.CurrentValue;
        var snap = _status.GetSnapshot();

        var data = new Dictionary<string, object?>
        {
            ["enabled"] = opt.Enabled,
            ["intervalSeconds"] = opt.IntervalSeconds,
            ["jitterSeconds"] = opt.JitterSeconds,
            ["runOnStartup"] = opt.RunOnStartup,
            ["lastRunUtc"] = snap.LastRunUtc,
            ["lastSuccessUtc"] = snap.LastSuccessUtc,
            ["lastUpdatedRulesCount"] = snap.LastUpdatedRulesCount,
            ["lastError"] = snap.LastError
        };

        if (!opt.Enabled)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Healthy,
                description: "Timetable auto-sync is disabled.",
                exception: null,
                data: data));
        }

        if (snap.LastRunUtc is null)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Degraded,
                description: "Timetable auto-sync has not run yet.",
                exception: null,
                data: data));
        }

        var interval = TimeSpan.FromSeconds(Math.Max(10, opt.IntervalSeconds));
        var now = DateTimeOffset.UtcNow;

        if (snap.LastSuccessUtc is null)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Unhealthy,
                description: "Timetable auto-sync has never succeeded.",
                exception: null,
                data: data));
        }

        var age = now - snap.LastSuccessUtc.Value;
        var maxAge = TimeSpan.FromTicks(interval.Ticks * 3);

        if (age > maxAge)
        {
            return Task.FromResult(new HealthCheckResult(
                status: HealthStatus.Unhealthy,
                description: "Timetable auto-sync is stale (last success too old).",
                exception: null,
                data: data));
        }

        if (!string.IsNullOrWhiteSpace(snap.LastError))
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