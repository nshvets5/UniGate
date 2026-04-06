using UniGate.Iam.Infrastructure.Outbox;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox;

public sealed class OutboxProcessorHostedService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<OutboxProcessorHostedService> _logger;
    private const int MaxAttempts = 10;

    public OutboxProcessorHostedService(
        IServiceProvider sp,
        ILogger<OutboxProcessorHostedService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();

                var reader = scope.ServiceProvider.GetRequiredService<IOutboxReader>();
                var dispatcher = scope.ServiceProvider.GetRequiredService<IOutboxMessageDispatcher>();

                var batch = await reader.DequeueBatchAsync(batchSize: 20, ct);

                if (batch.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(2), ct);
                    continue;
                }

                foreach (var msg in batch)
                {
                    if (ct.IsCancellationRequested)
                        break;

                    try
                    {
                        await dispatcher.DispatchAsync(msg, ct);
                        await reader.MarkProcessedAsync(msg.Id, ct);
                    }
                    catch (Exception ex)
                    {
                        await HandleFailureAsync(reader, msg, ex, ct);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Outbox processor loop error");
                await Task.Delay(TimeSpan.FromSeconds(5), ct);
            }
        }
    }

    private async Task HandleFailureAsync(
        IOutboxReader reader,
        OutboxMessage msg,
        Exception ex,
        CancellationToken ct)
    {
        if (msg.Attempts + 1 >= MaxAttempts)
        {
            await reader.MarkDeadLetterAsync(
                msg.Id,
                reason: $"Max attempts reached. Last error: {ex.Message}",
                ct);

            _logger.LogError(ex, "Dead-lettered outbox message {MessageId} type={Type}", msg.Id, msg.Type);
            return;
        }

        var delay = TimeSpan.FromSeconds(Math.Min(60, 2 + msg.Attempts * 5));
        await reader.MarkFailedAsync(msg.Id, ex.Message, delay, ct);
    }
}