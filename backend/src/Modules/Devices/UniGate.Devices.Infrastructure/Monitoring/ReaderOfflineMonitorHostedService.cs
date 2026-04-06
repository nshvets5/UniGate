using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Monitoring;

namespace UniGate.Devices.Infrastructure.Monitoring;

public sealed class ReaderOfflineMonitorHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<ReaderOfflineMonitorHostedService> _logger;

    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan OfflineThreshold = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan AlertCooldown = TimeSpan.FromMinutes(15);

    public ReaderOfflineMonitorHostedService(
        IServiceProvider sp,
        ILogger<ReaderOfflineMonitorHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reader offline monitor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);

                using var scope = _sp.CreateScope();
                var store = scope.ServiceProvider.GetRequiredService<IReaderOfflineMonitorStore>();

                var now = DateTimeOffset.UtcNow;
                var offlineBefore = now.Subtract(OfflineThreshold);
                var cooldownBefore = now.Subtract(AlertCooldown);

                var candidatesRes = await store.FindOfflineCandidatesAsync(
                    offlineBefore,
                    cooldownBefore,
                    stoppingToken);

                if (!candidatesRes.IsSuccess)
                {
                    _logger.LogWarning("Reader offline monitor failed to load candidates: {Error}", candidatesRes.Error.Code);
                    continue;
                }

                foreach (var reader in candidatesRes.Value)
                {
                    var emitRes = await store.EmitOfflineDetectedAsync(reader, stoppingToken);
                    if (!emitRes.IsSuccess)
                    {
                        _logger.LogWarning("Failed to emit offline alert for reader {ReaderCode}", reader.ReaderCode);
                        continue;
                    }

                    var markRes = await store.MarkOfflineAlertRaisedAsync(reader.ReaderId, stoppingToken);
                    if (!markRes.IsSuccess)
                    {
                        _logger.LogWarning("Failed to mark offline alert raised for reader {ReaderCode}", reader.ReaderCode);
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Reader offline monitor loop failed");
            }
        }

        _logger.LogInformation("Reader offline monitor stopped");
    }
}