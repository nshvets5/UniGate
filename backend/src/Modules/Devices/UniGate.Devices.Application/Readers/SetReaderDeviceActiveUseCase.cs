using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class SetReaderDeviceActiveUseCase
{
    private readonly IReaderDevicesStore _store;

    public SetReaderDeviceActiveUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result> ExecuteAsync(Guid id, bool isActive, CancellationToken ct = default)
    {
        if (id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        return _store.SetActiveAsync(id, isActive, ct);
    }
}