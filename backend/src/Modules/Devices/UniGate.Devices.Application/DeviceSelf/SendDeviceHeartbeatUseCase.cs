using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.DeviceSelf;

public sealed class SendDeviceHeartbeatUseCase
{
    private readonly ICurrentDevice _currentDevice;
    private readonly IDeviceSelfStore _store;

    public SendDeviceHeartbeatUseCase(ICurrentDevice currentDevice, IDeviceSelfStore store)
    {
        _currentDevice = currentDevice;
        _store = store;
    }

    public Task<Result> ExecuteAsync(CancellationToken ct = default)
    {
        if (!_currentDevice.IsAuthenticated || _currentDevice.ReaderId is null)
            return Task.FromResult(Result.Failure(
                new Error("device.unauthorized", "Device is not authenticated.")));

        return _store.HeartbeatAsync(_currentDevice.ReaderId.Value, ct);
    }
}