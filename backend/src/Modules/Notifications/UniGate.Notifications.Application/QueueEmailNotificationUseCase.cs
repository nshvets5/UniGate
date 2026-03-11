using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class QueueEmailNotificationUseCase
{
    private readonly INotificationStore _store;

    public QueueEmailNotificationUseCase(INotificationStore store)
    {
        _store = store;
    }

    public Task<Result<Guid>> ExecuteAsync(EmailMessageDto message, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(message.ToEmail))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("ToEmail is required.")));

        if (string.IsNullOrWhiteSpace(message.Subject))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Subject is required.")));

        if (string.IsNullOrWhiteSpace(message.Body))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Body is required.")));

        return _store.QueueEmailAsync(message, ct);
    }
}