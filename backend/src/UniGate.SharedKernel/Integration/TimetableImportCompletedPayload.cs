namespace UniGate.SharedKernel.Integration;

public sealed record TimetableImportCompletedPayload(
    Guid BatchId,
    string SourceType,
    string? SourceFileName,
    string? ImportedByProvider,
    string? ImportedBySubject,
    int TotalRows,
    int ImportedRows,
    int SkippedRows,
    DateTimeOffset OccurredAt);