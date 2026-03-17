namespace UniGate.SharedKernel.Integration;

public sealed record SuspiciousAccessDetectedPayload(
    string AlertCode,
    string Description,
    string? CredentialValue,
    Guid? ReaderId,
    Guid? DoorId,
    Guid? StudentId,
    int Attempts,
    DateTimeOffset OccurredAt);