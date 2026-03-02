using Microsoft.Extensions.Options;

namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableSyncStatusEvaluator
{
    private readonly TimetableSyncStatus _status;
    private readonly IOptionsMonitor<TimetableSyncOptions> _options;

    public TimetableSyncStatusEvaluator(TimetableSyncStatus status, IOptionsMonitor<TimetableSyncOptions> options)
    {
        _status = status;
        _options = options;
    }

    public Evaluation Evaluate(DateTimeOffset? nowUtc = null)
    {
        var opt = _options.CurrentValue;
        var snap = _status.GetSnapshot();
        var now = nowUtc ?? DateTimeOffset.UtcNow;

        var interval = TimeSpan.FromSeconds(Math.Max(10, opt.IntervalSeconds));
        var staleAfter = TimeSpan.FromTicks(interval.Ticks * 3);

        var age = snap.LastSuccessUtc is null ? (TimeSpan?)null : now - snap.LastSuccessUtc.Value;
        var isStale = opt.Enabled && snap.LastSuccessUtc is not null && age > staleAfter;

        return new Evaluation(
            Enabled: opt.Enabled,
            IntervalSeconds: opt.IntervalSeconds,
            JitterSeconds: opt.JitterSeconds,
            RunOnStartup: opt.RunOnStartup,
            LastRunUtc: snap.LastRunUtc,
            LastSuccessUtc: snap.LastSuccessUtc,
            LastUpdatedRulesCount: snap.LastUpdatedRulesCount,
            LastError: snap.LastError,
            AgeSeconds: age is null ? null : (long)age.Value.TotalSeconds,
            StaleAfterSeconds: (long)staleAfter.TotalSeconds,
            IsStale: isStale
        );
    }

    public sealed record Evaluation(
        bool Enabled,
        int IntervalSeconds,
        int JitterSeconds,
        bool RunOnStartup,
        DateTimeOffset? LastRunUtc,
        DateTimeOffset? LastSuccessUtc,
        int? LastUpdatedRulesCount,
        string? LastError,
        long? AgeSeconds,
        long StaleAfterSeconds,
        bool IsStale
    );
}