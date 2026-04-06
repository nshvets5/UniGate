using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.DeviceSelf;

public sealed class GetDeviceDashboardUseCase
{
    private readonly ICurrentDevice _currentDevice;
    private readonly IDeviceSelfStore _store;

    public GetDeviceDashboardUseCase(
        ICurrentDevice currentDevice,
        IDeviceSelfStore store)
    {
        _currentDevice = currentDevice;
        _store = store;
    }

    public Task<Result<DeviceDashboardDto>> ExecuteAsync(int recentTake, CancellationToken ct = default)
    {
        if (!_currentDevice.IsAuthenticated || _currentDevice.ReaderId is null)
        {
            return Task.FromResult(Result<DeviceDashboardDto>.Failure(
                new Error("device.unauthorized", "Device is not authenticated.")));
        }

        if (recentTake is < 1 or > 100)
        {
            return Task.FromResult(Result<DeviceDashboardDto>.Failure(
                Errors.Validation.Failed("recentTake must be between 1 and 100.")));
        }

        return _store.GetDashboardAsync(_currentDevice.ReaderId.Value, recentTake, ct);
    }
}