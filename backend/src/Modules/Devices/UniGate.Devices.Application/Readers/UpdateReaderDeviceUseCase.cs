using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class UpdateReaderDeviceUseCase
{
    private readonly IReaderDevicesStore _store;

    public UpdateReaderDeviceUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result> ExecuteAsync(UpdateReaderDeviceCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Code))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Code is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Name is required.")));

        if (cmd.DoorId == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("DoorId is required.")));

        return _store.UpdateAsync(cmd, ct);
    }
}