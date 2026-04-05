using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Scan;

public interface IReaderScanStore
{
    Task<Result<ReaderDoorDto>> GetReaderDoorAsync(Guid readerId, CancellationToken ct = default);

    Task<Result> LogAttemptAsync(ReaderScanLogEntry entry, CancellationToken ct = default);

    Task<Result> TouchReaderAsync(Guid readerId, CancellationToken ct = default);
}

public sealed record ReaderDoorDto(
    Guid ReaderId,
    Guid DoorId,
    bool ReaderIsActive);

public sealed record ReaderScanLogEntry(
    Guid ReaderId,
    string CredentialType,
    string CredentialValue,
    Guid? CredentialId,
    Guid? StudentId,
    bool IsAllowed,
    string ReasonCode);