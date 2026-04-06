using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class GetReaderDeviceStatusUseCase
{
    private readonly IReaderDevicesStore _store;

    public GetReaderDeviceStatusUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result<ReaderDeviceStatusDto>> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        if (id == Guid.Empty)
            return Task.FromResult(Result<ReaderDeviceStatusDto>.Failure(
                Errors.Validation.Failed("Id is required.")));

        return _store.GetStatusAsync(id, ct);
    }
}