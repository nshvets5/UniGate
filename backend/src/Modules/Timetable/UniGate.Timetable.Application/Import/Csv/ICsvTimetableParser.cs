using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Csv;

public sealed record ParsedCsvSlot(
    int LineNumber,
    Guid GroupId,
    string RoomCode,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    string? Title);

public sealed record CsvParseResult(
    IReadOnlyList<ParsedCsvSlot> Rows,
    IReadOnlyList<Import.ImportIssue> Issues);

public interface ICsvTimetableParser
{
    Task<Result<CsvParseResult>> ParseAsync(
        string csvText,
        CancellationToken ct = default);
}