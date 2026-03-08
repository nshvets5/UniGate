namespace UniGate.Timetable.Application.Diff;

public sealed record TimetableSlotSnapshotDto(
    Guid GroupId,
    Guid ZoneId,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    string? Title);

public sealed record TimetableBatchDiffDto(
    Guid OldBatchId,
    Guid NewBatchId,
    int AddedCount,
    int RemovedCount,
    int UnchangedCount,
    IReadOnlyList<TimetableSlotSnapshotDto> Added,
    IReadOnlyList<TimetableSlotSnapshotDto> Removed,
    IReadOnlyList<TimetableSlotSnapshotDto> Unchanged);