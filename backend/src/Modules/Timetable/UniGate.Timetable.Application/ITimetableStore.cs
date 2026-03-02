using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application;

public interface ITimetableStore
{
    Task<Result<int>> ReplaceAllSlotsAsync(IReadOnlyList<ImportSlotRow> rows, CancellationToken ct = default);
    Task<Result<IReadOnlyList<ImportSlotRow>>> ListSlotsAsync(int take, CancellationToken ct = default);
}

public sealed record ImportSlotRow(
    Guid GroupId,
    Guid ZoneId,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    string? Title);