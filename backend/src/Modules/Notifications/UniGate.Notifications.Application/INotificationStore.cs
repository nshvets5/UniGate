using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public interface INotificationStore
{
    Task<Result<Guid>> QueueEmailAsync(EmailMessageDto message, CancellationToken ct = default);

    Task<IReadOnlyList<NotificationQueueItem>> DequeuePendingBatchAsync(int batchSize, CancellationToken ct = default);

    Task<Result> MarkSentAsync(Guid notificationId, CancellationToken ct = default);

    Task<Result> RequeueAsync(Guid notificationId, string error, TimeSpan retryDelay, CancellationToken ct = default);

    Task<Result> LogAttemptAsync(Guid notificationId, bool isSuccess, string? error, CancellationToken ct = default);
}

public sealed record NotificationQueueItem(
    Guid Id,
    string ToEmail,
    string Subject,
    string Body,
    bool IsHtml,
    int Attempts);