using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class ListReaderDevicesUseCase
{
    private readonly IReaderDevicesStore _store;

    public ListReaderDevicesUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result<PagedResult<ReaderDeviceDto>>> ExecuteAsync(string? search, int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1 || pageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<ReaderDeviceDto>>.Failure(
                Errors.Validation.Failed("Invalid paging.")));

        return _store.ListAsync(search, page, pageSize, ct);
    }
}