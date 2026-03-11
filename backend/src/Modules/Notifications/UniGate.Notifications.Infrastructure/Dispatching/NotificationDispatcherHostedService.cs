using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniGate.Notifications.Application;

namespace UniGate.Notifications.Infrastructure.Dispatching;

public sealed class NotificationDispatcherHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<NotificationDispatcherHostedService> _logger;

    public NotificationDispatcherHostedService(IServiceProvider sp, ILogger<NotificationDispatcherHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var store = scope.ServiceProvider.GetRequiredService<INotificationStore>();
                var sender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

                var batch = await store.DequeuePendingBatchAsync(20, stoppingToken);

                if (batch.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                    continue;
                }

                foreach (var item in batch)
                {
                    var result = await sender.SendAsync(new EmailMessageDto(
                        item.ToEmail,
                        item.Subject,
                        item.Body,
                        item.IsHtml), stoppingToken);

                    await store.LogAttemptAsync(item.Id, result.IsSuccess, result.Error, stoppingToken);

                    if (result.IsSuccess)
                    {
                        await store.MarkSentAsync(item.Id, stoppingToken);
                    }
                    else
                    {
                        var delay = item.Attempts switch
                        {
                            0 => TimeSpan.FromMinutes(1),
                            1 => TimeSpan.FromMinutes(5),
                            2 => TimeSpan.FromMinutes(15),
                            _ => TimeSpan.FromMinutes(30)
                        };

                        await store.RequeueAsync(item.Id, result.Error ?? "Unknown email delivery error", delay, stoppingToken);
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Notification dispatcher loop failed");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }
}