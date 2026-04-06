namespace UniGate.Devices.Application.Attempts;

public sealed record ReaderScanAttemptsQuery(
    Guid? ReaderId,
    bool? IsAllowed,
    string? CredentialType,
    string? CredentialValue,
    DateTimeOffset? FromUtc,
    DateTimeOffset? ToUtc,
    int Page,
    int PageSize);