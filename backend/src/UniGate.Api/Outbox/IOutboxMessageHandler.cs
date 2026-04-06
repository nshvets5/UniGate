using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox;

public interface IOutboxMessageHandler
{
    bool CanHandle(string messageType);

    Task HandleAsync(OutboxMessage message, CancellationToken ct);
}