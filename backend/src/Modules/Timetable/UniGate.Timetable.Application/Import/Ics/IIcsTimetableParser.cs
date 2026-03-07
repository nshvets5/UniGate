using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Ics;

public sealed record ParsedIcsSlot(
    int SequenceNumber,
    string RoomCode,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Title);

public sealed record IcsParseResult(
    IReadOnlyList<ParsedIcsSlot> Rows,
    IReadOnlyList<ImportIssue> Issues);

public interface IIcsTimetableParser
{
    Task<Result<IcsParseResult>> ParseAsync(
        string icsText,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default);
}