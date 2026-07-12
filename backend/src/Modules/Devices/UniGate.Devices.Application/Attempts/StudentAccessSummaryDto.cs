namespace UniGate.Devices.Application.Attempts;

public sealed record StudentAccessSummaryDto(
    long TotalAttempts,
    long AllowedAttempts,
    long DeniedAttempts,
    DateTimeOffset? LastAttemptAt);