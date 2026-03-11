using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SendTestEmailUseCase
{
    private readonly QueueEmailNotificationUseCase _queue;

    public SendTestEmailUseCase(QueueEmailNotificationUseCase queue)
    {
        _queue = queue;
    }

    public Task<Result<Guid>> ExecuteAsync(string toEmail, CancellationToken ct = default)
    {
        var msg = new EmailMessageDto(
            ToEmail: toEmail,
            Subject: "UniGate test email",
            Body: "This is a test email from UniGate Notifications module.",
            IsHtml: false);

        return _queue.ExecuteAsync(msg, ct);
    }
}