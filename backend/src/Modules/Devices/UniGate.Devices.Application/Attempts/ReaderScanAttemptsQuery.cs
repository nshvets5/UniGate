namespace UniGate.Devices.Application.Attempts;

public sealed record ReaderScanAttemptsQuery(
    Guid? ReaderId,
    Guid? StudentId,
    bool? IsAllowed,
    string? CredentialType,
    string? CredentialValue,
    DateTimeOffset? FromUtc,
    DateTimeOffset? ToUtc,
    int Page,
    int PageSize);