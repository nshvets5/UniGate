namespace UniGate.Timetable.Application.Import;

public sealed record ImportIssue(
    int? LineNumber,
    string Code,
    string Message);

public sealed record ImportReport(
    int TotalRows,
    int ImportedRows,
    int SkippedRows,
    IReadOnlyList<ImportIssue> Issues);