using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UniGate.Timetable.Application;

namespace UniGate.Timetable.Infrastructure.Sync;

public sealed class TimetableAutoSyncHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly IOptionsMonitor<TimetableSyncOptions> _options;
    private readonly ILogger<TimetableAutoSyncHostedService> _logger;
    private readonly TimetableSyncStatus _status;

    public TimetableAutoSyncHostedService(
        IServiceProvider sp,
        IOptionsMonitor<TimetableSyncOptions> options,
        TimetableSyncStatus status,
        ILogger<TimetableAutoSyncHostedService> logger)
    {
        _sp = sp;
        _options = options;
        _status = status;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var opt = _options.CurrentValue;

            if (!opt.Enabled)
            {
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                continue;
            }

            if (opt.RunOnStartup)
            {
                await RunOnceSafeAsync(stoppingToken);

                await RunPeriodicAsync(stoppingToken);
                return;
            }

            await RunPeriodicAsync(stoppingToken);
            return;
        }
    }

    private async Task RunPeriodicAsync(CancellationToken ct)
    {
        var opt = _options.CurrentValue;

        var interval = TimeSpan.FromSeconds(Math.Max(10, opt.IntervalSeconds));
        using var timer = new PeriodicTimer(interval);

        while (await timer.WaitForNextTickAsync(ct))
        {
            await RunOnceSafeAsync(ct);
        }
    }

    private async Task RunOnceSafeAsync(CancellationToken ct)
    {
        var opt = _options.CurrentValue;

        var started = DateTimeOffset.UtcNow;
        _status.MarkRun(started);

        var jitter = Math.Max(0, opt.JitterSeconds);
        if (jitter > 0)
        {
            var delay = Random.Shared.Next(0, jitter + 1);
            if (delay > 0)
                await Task.Delay(TimeSpan.FromSeconds(delay), ct);
        }

        try
        {
            using var scope = _sp.CreateScope();
            var sync = scope.ServiceProvider.GetRequiredService<SyncTimetableToAccessUseCase>();

            var res = await sync.ExecuteAsync(ct);

            if (res.IsSuccess)
            {
                _status.MarkSuccess(DateTimeOffset.UtcNow, res.Value);

                _logger.LogInformation("Timetable auto-sync succeeded. Updated rules: {Count}. Took {Ms} ms",
                    res.Value,
                    (DateTimeOffset.UtcNow - started).TotalMilliseconds);
            }
            else
            {
                _status.MarkFailure(DateTimeOffset.UtcNow, $"{res.Error.Code}: {res.Error.Message}");

                _logger.LogWarning("Timetable auto-sync failed. Code={Code}, Message={Message}",
                    res.Error.Code, res.Error.Message);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {

        }
        catch (Exception ex)
        {
            _status.MarkFailure(DateTimeOffset.UtcNow, ex.Message);
            _logger.LogError(ex, "Timetable auto-sync crashed (will retry on next tick).");
        }
    }
}