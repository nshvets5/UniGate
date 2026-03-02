namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableSyncOptions
{
    public bool Enabled { get; set; } = true;

    public int IntervalSeconds { get; set; } = 300; // 5 min

    public int JitterSeconds { get; set; } = 10;

    public bool RunOnStartup { get; set; } = true;
}