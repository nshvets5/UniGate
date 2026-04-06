using UniGate.Devices.Application.Attempts;

namespace UniGate.Devices.Application.DeviceSelf;

public sealed record DeviceDashboardCountersDto(
    int TotalAttempts,
    int AllowedAttempts,
    int DeniedAttempts);

public sealed record DeviceDashboardDto(
    DeviceSelfDto Device,
    DeviceDashboardCountersDto Counters,
    IReadOnlyList<ReaderScanAttemptDto> RecentAttempts);