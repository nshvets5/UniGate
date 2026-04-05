using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class CreateReaderDeviceUseCase
{
    private readonly IReaderDevicesStore _store;

    public CreateReaderDeviceUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result<ReaderDeviceCreatedDto>> ExecuteAsync(CreateReaderDeviceCommand cmd, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(cmd.Code))
            return Task.FromResult(Result<ReaderDeviceCreatedDto>.Failure(Errors.Validation.Failed("Code is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result<ReaderDeviceCreatedDto>.Failure(Errors.Validation.Failed("Name is required.")));

        if (cmd.DoorId == Guid.Empty)
            return Task.FromResult(Result<ReaderDeviceCreatedDto>.Failure(Errors.Validation.Failed("DoorId is required.")));

        return _store.CreateAsync(cmd, ct);
    }
}