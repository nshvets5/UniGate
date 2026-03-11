namespace UniGate.Notifications.Application;

public interface IEmailSender
{
    Task<EmailSenderResult> SendAsync(EmailMessageDto message, CancellationToken ct = default);
}