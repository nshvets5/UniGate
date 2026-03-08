using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniGate.Timetable.Application.Import;

namespace UniGate.Timetable.Infrastructure.Import;

public sealed class PreviewCleanupHostedService : BackgroundService
{
    private readonly IImportPreviewStore _store;
    private readonly ILogger<PreviewCleanupHostedService> _logger;

    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

    public PreviewCleanupHostedService(
        IImportPreviewStore store,
        ILogger<PreviewCleanupHostedService> logger)
    {
        _store = store;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Preview cleanup service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);

                var stats = await _store.GetStatsAsync(stoppingToken);

                _logger.LogInformation(
                    "Preview store stats: total={Total} expired={Expired}",
                    stats.TotalEntries,
                    stats.ExpiredEntries);
            }
            catch (OperationCanceledException)
            {
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Preview cleanup job failed");
            }
        }

        _logger.LogInformation("Preview cleanup service stopped");
    }
}