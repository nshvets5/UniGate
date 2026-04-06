namespace UniGate.SharedKernel.Integration;

public sealed record ReaderOfflineDetectedPayload(
    Guid ReaderId,
    string ReaderCode,
    string ReaderName,
    Guid DoorId,
    DateTimeOffset? LastSeenAt,
    DateTimeOffset DetectedAt);