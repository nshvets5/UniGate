namespace UniGate.Devices.Application.Scan;

public sealed record ReaderScanResultDto(
    bool Allowed,
    string ReasonCode,
    Guid ReaderId,
    Guid DoorId,
    Guid? StudentId,
    Guid? CredentialId);