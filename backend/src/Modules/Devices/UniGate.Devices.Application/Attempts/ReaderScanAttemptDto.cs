namespace UniGate.Devices.Application.Attempts;

public sealed record ReaderScanAttemptDto(
    Guid Id,
    Guid ReaderId,
    string CredentialType,
    string CredentialValue,
    Guid? CredentialId,
    Guid? StudentId,
    bool IsAllowed,
    string ReasonCode,
    DateTimeOffset OccurredAt);