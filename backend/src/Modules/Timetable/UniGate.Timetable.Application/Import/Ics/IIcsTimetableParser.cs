using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Ics;

public sealed record ParsedIcsSlot(
    string RoomCode,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Title);

public interface IIcsTimetableParser
{
    Task<Result<IReadOnlyList<ParsedIcsSlot>>> ParseAsync(
        string icsText,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default);
}