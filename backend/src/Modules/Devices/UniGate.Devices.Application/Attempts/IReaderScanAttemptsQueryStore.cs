using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Attempts;

public interface IReaderScanAttemptsQueryStore
{
    Task<Result<PagedResult<ReaderScanAttemptDto>>> ListAsync(
        ReaderScanAttemptsQuery query,
        CancellationToken ct = default);
}