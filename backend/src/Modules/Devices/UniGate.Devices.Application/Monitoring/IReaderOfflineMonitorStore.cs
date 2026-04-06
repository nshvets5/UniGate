using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Monitoring;

public interface IReaderOfflineMonitorStore
{
    Task<Result<IReadOnlyList<OfflineReaderCandidateDto>>> FindOfflineCandidatesAsync(
        DateTimeOffset offlineBeforeUtc,
        DateTimeOffset alertCooldownBeforeUtc,
        CancellationToken ct = default);

    Task<Result> EmitOfflineDetectedAsync(OfflineReaderCandidateDto reader, CancellationToken ct = default);

    Task<Result> MarkOfflineAlertRaisedAsync(Guid readerId, CancellationToken ct = default);
}

public sealed record OfflineReaderCandidateDto(
    Guid ReaderId,
    string ReaderCode,
    string ReaderName,
    Guid DoorId,
    DateTimeOffset? LastSeenAt);