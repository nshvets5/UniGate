using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public sealed record TimetableParseRequest(
    Stream FileStream,
    string? SourceFileName,
    Guid? DefaultGroupId,
    DateOnly? FromDate,
    int? RangeDays,
    string? TimeZoneId);

public sealed record TimetableParseResult(
    string SourceType,
    IReadOnlyList<RawParsedSlot> Rows,
    IReadOnlyList<ImportIssue> Issues);

public interface ITimetableImportSourceParser
{
    string SourceType { get; }

    Task<Result<TimetableParseResult>> ParseAsync(
        TimetableParseRequest request,
        CancellationToken ct = default);
}