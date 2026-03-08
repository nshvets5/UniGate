using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public sealed class ApplyImportPreviewUseCase
{
    private readonly IImportPreviewStore _previewStore;
    private readonly ITimetableStore _store;

    public ApplyImportPreviewUseCase(IImportPreviewStore previewStore, ITimetableStore store)
    {
        _previewStore = previewStore;
        _store = store;
    }

    public async Task<Result<Guid>> ExecuteAsync(string previewToken, CancellationToken ct = default)
    {
        var previewRes = await _previewStore.GetAsync(previewToken, ct);
        if (!previewRes.IsSuccess)
            return Result<Guid>.Failure(previewRes.Error);

        var p = previewRes.Value;

        var importRes = await _store.ImportBatchAsync(
            sourceType: p.SourceType,
            sourceFileName: p.SourceFileName,
            importedByProvider: p.ImportedByProvider,
            importedBySubject: p.ImportedBySubject,
            rows: p.Rows,
            totalRows: p.TotalRows,
            skippedRows: p.SkippedRows,
            ct: ct);

        if (!importRes.IsSuccess)
            return Result<Guid>.Failure(importRes.Error);

        await _previewStore.DeleteAsync(previewToken, ct);

        return Result<Guid>.Success(importRes.Value);
    }
}