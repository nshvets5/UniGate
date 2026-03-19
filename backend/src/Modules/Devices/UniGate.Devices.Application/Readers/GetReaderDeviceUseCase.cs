using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class GetReaderDeviceUseCase
{
    private readonly IReaderDevicesStore _store;

    public GetReaderDeviceUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result<ReaderDeviceDto>> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        if (id == Guid.Empty)
            return Task.FromResult(Result<ReaderDeviceDto>.Failure(
                Errors.Validation.Failed("Id is required.")));

        return _store.GetAsync(id, ct);
    }
}