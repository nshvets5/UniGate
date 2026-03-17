using Microsoft.Extensions.Options;
using UniGate.SharedKernel.Notifications;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SystemNotificationsService
{
    private readonly QueueEmailNotificationUseCase _queue;
    private readonly AdminNotificationOptions _options;

    public SystemNotificationsService(
        QueueEmailNotificationUseCase queue,
        IOptions<AdminNotificationOptions> options)
    {
        _queue = queue;
        _options = options.Value;
    }

    public async Task<Result<int>> SendToAdminsAsync(
        string subject,
        string body,
        bool isHtml,
        CancellationToken ct = default)
    {
        if (_options.Recipients.Count == 0)
            return Result<int>.Failure(new Error("notifications.admin_recipients_missing", "Admin notification recipients are not configured."));

        var sent = 0;

        foreach (var email in _options.Recipients
                     .Where(x => !string.IsNullOrWhiteSpace(x))
                     .Select(x => x.Trim())
                     .Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var res = await _queue.ExecuteAsync(new EmailMessageDto(
                ToEmail: email,
                Subject: subject,
                Body: body,
                IsHtml: isHtml), ct);

            if (!res.IsSuccess)
                return Result<int>.Failure(res.Error);

            sent++;
        }

        return Result<int>.Success(sent);
    }
}