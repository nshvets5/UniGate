using UniGate.Devices.Application.Attempts;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.DeviceSelf;

public sealed class ListDeviceOwnAttemptsUseCase
{
    private readonly ICurrentDevice _currentDevice;
    private readonly IDeviceSelfStore _store;

    public ListDeviceOwnAttemptsUseCase(ICurrentDevice currentDevice, IDeviceSelfStore store)
    {
        _currentDevice = currentDevice;
        _store = store;
    }

    public Task<Result<PagedResult<ReaderScanAttemptDto>>> ExecuteAsync(int page, int pageSize, CancellationToken ct = default)
    {
        if (!_currentDevice.IsAuthenticated || _currentDevice.ReaderId is null)
            return Task.FromResult(Result<PagedResult<ReaderScanAttemptDto>>.Failure(
                new Error("device.unauthorized", "Device is not authenticated.")));

        if (page < 1 || pageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<ReaderScanAttemptDto>>.Failure(
                Errors.Validation.Failed("Invalid paging.")));

        return _store.ListOwnAttemptsAsync(_currentDevice.ReaderId.Value, page, pageSize, ct);
    }
}