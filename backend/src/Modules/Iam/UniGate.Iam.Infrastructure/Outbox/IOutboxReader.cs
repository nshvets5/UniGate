using UniGate.SharedKernel.Outbox;

namespace UniGate.Iam.Infrastructure.Outbox;

public interface IOutboxReader
{
    Task<IReadOnlyList<OutboxMessage>> DequeueBatchAsync(int batchSize, CancellationToken ct);
    Task MarkProcessedAsync(Guid messageId, CancellationToken ct);
    Task MarkFailedAsync(Guid messageId, string error, TimeSpan retryDelay, CancellationToken ct);
    Task MarkDeadLetterAsync(Guid messageId, string reason, CancellationToken ct);
}
