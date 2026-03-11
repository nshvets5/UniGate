namespace UniGate.Notifications.Domain;

public sealed class NotificationMessage
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Channel { get; private set; } = "email";

    public string ToEmail { get; private set; } = default!;
    public string Subject { get; private set; } = default!;
    public string Body { get; private set; } = default!;
    public bool IsHtml { get; private set; }

    public NotificationStatus Status { get; private set; } = NotificationStatus.Pending;

    public int Attempts { get; private set; }
    public string? LastError { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SentAt { get; private set; }
    public DateTimeOffset? LastAttemptAt { get; private set; }
    public DateTimeOffset AvailableAt { get; private set; } = DateTimeOffset.UtcNow;

    private NotificationMessage() { }

    public NotificationMessage(string toEmail, string subject, string body, bool isHtml)
    {
        ToEmail = toEmail.Trim();
        Subject = subject.Trim();
        Body = body;
        IsHtml = isHtml;

        Channel = "email";
        Status = NotificationStatus.Pending;
        CreatedAt = DateTimeOffset.UtcNow;
        AvailableAt = DateTimeOffset.UtcNow;
    }

    public void MarkSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTimeOffset.UtcNow;
        LastError = null;
        LastAttemptAt = DateTimeOffset.UtcNow;
    }

    public void MarkFailed(string error, TimeSpan retryDelay)
    {
        Attempts++;
        LastError = error;
        LastAttemptAt = DateTimeOffset.UtcNow;
        Status = NotificationStatus.Failed;
        AvailableAt = DateTimeOffset.UtcNow.Add(retryDelay);
    }

    public void Requeue(TimeSpan retryDelay, string error)
    {
        Attempts++;
        LastError = error;
        LastAttemptAt = DateTimeOffset.UtcNow;
        Status = NotificationStatus.Pending;
        AvailableAt = DateTimeOffset.UtcNow.Add(retryDelay);
    }
}