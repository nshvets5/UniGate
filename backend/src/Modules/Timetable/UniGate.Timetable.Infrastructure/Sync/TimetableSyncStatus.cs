namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableSyncStatus
{
    private readonly object _lock = new();

    public DateTimeOffset? LastRunUtc { get; private set; }
    public DateTimeOffset? LastSuccessUtc { get; private set; }
    public string? LastError { get; private set; }
    public int? LastUpdatedRulesCount { get; private set; }

    public void MarkRun(DateTimeOffset utcNow)
    {
        lock (_lock)
        {
            LastRunUtc = utcNow;
        }
    }

    public void MarkSuccess(DateTimeOffset utcNow, int updatedRulesCount)
    {
        lock (_lock)
        {
            LastRunUtc = utcNow;
            LastSuccessUtc = utcNow;
            LastError = null;
            LastUpdatedRulesCount = updatedRulesCount;
        }
    }

    public void MarkFailure(DateTimeOffset utcNow, string error)
    {
        lock (_lock)
        {
            LastRunUtc = utcNow;
            LastError = error;
        }
    }

    public Snapshot GetSnapshot()
    {
        lock (_lock)
        {
            return new Snapshot(
                LastRunUtc,
                LastSuccessUtc,
                LastError,
                LastUpdatedRulesCount);
        }
    }

    public sealed record Snapshot(
        DateTimeOffset? LastRunUtc,
        DateTimeOffset? LastSuccessUtc,
        string? LastError,
        int? LastUpdatedRulesCount);
}