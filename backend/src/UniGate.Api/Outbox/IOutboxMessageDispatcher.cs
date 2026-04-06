using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox;

public interface IOutboxMessageDispatcher
{
    Task DispatchAsync(OutboxMessage message, CancellationToken ct);
}