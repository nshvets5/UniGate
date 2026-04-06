using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Attempts;

public sealed class ListReaderScanAttemptsUseCase
{
    private readonly IReaderScanAttemptsQueryStore _store;

    public ListReaderScanAttemptsUseCase(IReaderScanAttemptsQueryStore store)
    {
        _store = store;
    }

    public Task<Result<PagedResult<ReaderScanAttemptDto>>> ExecuteAsync(
        ReaderScanAttemptsQuery query,
        CancellationToken ct = default)
    {
        if (query.Page < 1)
            return Task.FromResult(Result<PagedResult<ReaderScanAttemptDto>>.Failure(
                Errors.Validation.Failed("Page must be >= 1.")));

        if (query.PageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<ReaderScanAttemptDto>>.Failure(
                Errors.Validation.Failed("PageSize must be between 1 and 200.")));

        if (query.FromUtc is not null && query.ToUtc is not null && query.ToUtc < query.FromUtc)
            return Task.FromResult(Result<PagedResult<ReaderScanAttemptDto>>.Failure(
                Errors.Validation.Failed("ToUtc must be >= FromUtc.")));

        return _store.ListAsync(query, ct);
    }
}