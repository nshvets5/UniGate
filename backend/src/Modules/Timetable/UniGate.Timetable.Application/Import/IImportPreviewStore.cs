using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public sealed record PreviewPayload(
    string SourceType,
    string? SourceFileName,
    string? ImportedByProvider,
    string? ImportedBySubject,
    IReadOnlyList<ImportSlotRow> Rows,
    int TotalRows,
    int SkippedRows);

public interface IImportPreviewStore
{
    Task<Result<string>> SaveAsync(PreviewPayload payload, CancellationToken ct = default);

    Task<Result<PreviewPayload>> GetAsync(string token, CancellationToken ct = default);

    Task<Result> DeleteAsync(string token, CancellationToken ct = default);
}