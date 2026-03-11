namespace UniGate.Notifications.Domain;

public sealed class EmailDeliveryAttempt
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid NotificationId { get; private set; }

    public bool IsSuccess { get; private set; }
    public string? Error { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private EmailDeliveryAttempt() { }

    public EmailDeliveryAttempt(Guid notificationId, bool isSuccess, string? error)
    {
        NotificationId = notificationId;
        IsSuccess = isSuccess;
        Error = error;
        CreatedAt = DateTimeOffset.UtcNow;
    }
}