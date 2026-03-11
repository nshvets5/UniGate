namespace UniGate.Notifications.Application;

public sealed record EmailSenderResult(
    bool IsSuccess,
    string? Error);