using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application;

public interface ITimetableStore
{
    Task<Result<Guid>> ImportBatchAsync(
        string sourceType,
        string? sourceFileName,
        string? importedByProvider,
        string? importedBySubject,
        IReadOnlyList<ImportSlotRow> rows,
        int totalRows,
        int skippedRows,
        CancellationToken ct = default);

    Task<Result<IReadOnlyList<ImportSlotRow>>> ListActiveSlotsAsync(int take, CancellationToken ct = default);

    Task<Result<IReadOnlyList<TimetableImportBatchDto>>> ListBatchesAsync(int take, CancellationToken ct = default);

    Task<Result> ActivateBatchAsync(Guid batchId, CancellationToken ct = default);
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

public sealed record TimetableImportBatchDto(
    Guid Id,
    string SourceType,
    string? SourceFileName,
    string? ImportedByProvider,
    string? ImportedBySubject,
    int TotalRows,
    int ImportedRows,
    int SkippedRows,
    bool IsActive,
    DateTimeOffset CreatedAt);