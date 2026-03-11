namespace UniGate.Notifications.Application;

public sealed record EmailMessageDto(
    string ToEmail,
    string Subject,
    string Body,
    bool IsHtml);