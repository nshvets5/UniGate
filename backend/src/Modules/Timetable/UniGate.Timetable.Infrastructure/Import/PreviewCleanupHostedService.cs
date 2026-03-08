using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniGate.Timetable.Infrastructure.Persistence;

namespace UniGate.Timetable.Infrastructure.Import;

public sealed class PreviewCleanupHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<PreviewCleanupHostedService> _logger;

    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

    public PreviewCleanupHostedService(
        IServiceProvider sp,
        ILogger<PreviewCleanupHostedService> logger)
    {
        _sp = sp;
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

                using var scope = _sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<TimetableDbContext>();

                var now = DateTimeOffset.UtcNow;

                var expired = await db.ImportPreviews
                    .Where(x => x.ExpiresAt <= now || x.AppliedAt != null)
                    .ToListAsync(stoppingToken);

                if (expired.Count > 0)
                {
                    db.ImportPreviews.RemoveRange(expired);
                    await db.SaveChangesAsync(stoppingToken);
                }

                _logger.LogInformation(
                    "Preview cleanup completed. Removed={Count}",
                    expired.Count);
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