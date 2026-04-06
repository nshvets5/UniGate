using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public sealed class RotateReaderApiKeyUseCase
{
    private readonly IReaderDevicesStore _store;

    public RotateReaderApiKeyUseCase(IReaderDevicesStore store)
    {
        _store = store;
    }

    public Task<Result<ReaderApiKeyRotatedDto>> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        if (id == Guid.Empty)
            return Task.FromResult(Result<ReaderApiKeyRotatedDto>.Failure(
                Errors.Validation.Failed("Id is required.")));

        return _store.RotateApiKeyAsync(id, ct);
    }
}