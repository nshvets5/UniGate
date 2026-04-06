using UniGate.Devices.Application.Attempts;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.DeviceSelf;

public interface IDeviceSelfStore
{
    Task<Result<DeviceSelfDto>> GetSelfAsync(Guid readerId, CancellationToken ct = default);

    Task<Result> HeartbeatAsync(Guid readerId, CancellationToken ct = default);

    Task<Result<PagedResult<ReaderScanAttemptDto>>> ListOwnAttemptsAsync(
        Guid readerId,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<Result<DeviceDashboardDto>> GetDashboardAsync(
        Guid readerId,
        int recentTake,
        CancellationToken ct = default);
}