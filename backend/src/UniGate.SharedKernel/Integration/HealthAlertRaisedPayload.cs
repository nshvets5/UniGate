namespace UniGate.SharedKernel.Integration;

public sealed record HealthAlertRaisedPayload(
    string CheckName,
    string Status,
    string Description,
    DateTimeOffset OccurredAt);