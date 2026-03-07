using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Csv;

public sealed record ParsedCsvSlot(
    Guid GroupId,
    string RoomCode,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    string? Title);

public interface ICsvTimetableParser
{
    Task<Result<IReadOnlyList<ParsedCsvSlot>>> ParseAsync(
        string csvText,
        CancellationToken ct = default);
}