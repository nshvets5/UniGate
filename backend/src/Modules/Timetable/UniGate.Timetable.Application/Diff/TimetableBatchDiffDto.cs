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

public sealed record TimetableSlotChangedDto(
    string SemanticKey,
    TimetableSlotSnapshotDto Old,
    TimetableSlotSnapshotDto New);

public sealed record TimetableBatchDiffDto(
    Guid OldBatchId,
    Guid NewBatchId,
    int AddedCount,
    int RemovedCount,
    int ChangedCount,
    int UnchangedCount,
    IReadOnlyList<TimetableSlotSnapshotDto> Added,
    IReadOnlyList<TimetableSlotSnapshotDto> Removed,
    IReadOnlyList<TimetableSlotChangedDto> Changed,
    IReadOnlyList<TimetableSlotSnapshotDto> Unchanged);