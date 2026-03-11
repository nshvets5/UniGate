using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Notifications.Application;
using UniGate.Notifications.Domain;
using UniGate.Notifications.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Infrastructure.Stores;

public sealed class EfNotificationStore : INotificationStore
{
    private readonly NotificationsDbContext _db;
    private readonly ILogger<EfNotificationStore> _logger;

    public EfNotificationStore(NotificationsDbContext db, ILogger<EfNotificationStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> QueueEmailAsync(EmailMessageDto message, CancellationToken ct = default)
    {
        try
        {
            var entity = new NotificationMessage(
                message.ToEmail,
                message.Subject,
                message.Body,
                message.IsHtml);

            _db.Notifications.Add(entity);
            await _db.SaveChangesAsync(ct);

            return Result<Guid>.Success(entity.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to queue email notification");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<IReadOnlyList<NotificationQueueItem>> DequeuePendingBatchAsync(int batchSize, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;

        return await _db.Notifications.AsNoTracking()
            .Where(x => x.Status == NotificationStatus.Pending && x.AvailableAt <= now)
            .OrderBy(x => x.CreatedAt)
            .Take(batchSize)
            .Select(x => new NotificationQueueItem(
                x.Id,
                x.ToEmail,
                x.Subject,
                x.Body,
                x.IsHtml,
                x.Attempts))
            .ToListAsync(ct);
    }

    public async Task<Result> MarkSentAsync(Guid notificationId, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId, ct);
            if (entity is null)
                return Result.Failure(new Error("notifications.not_found", "Notification not found."));

            entity.MarkSent();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark notification as sent");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> RequeueAsync(Guid notificationId, string error, TimeSpan retryDelay, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId, ct);
            if (entity is null)
                return Result.Failure(new Error("notifications.not_found", "Notification not found."));

            entity.Requeue(retryDelay, error);
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to requeue notification");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> LogAttemptAsync(Guid notificationId, bool isSuccess, string? error, CancellationToken ct = default)
    {
        try
        {
            _db.DeliveryAttempts.Add(new EmailDeliveryAttempt(notificationId, isSuccess, error));
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log delivery attempt");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}