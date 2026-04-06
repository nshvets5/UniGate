using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox;

public sealed class OutboxMessageDispatcher : IOutboxMessageDispatcher
{
    private readonly IReadOnlyList<IOutboxMessageHandler> _handlers;

    public OutboxMessageDispatcher(IEnumerable<IOutboxMessageHandler> handlers)
    {
        _handlers = handlers.ToList();
    }

    public async Task DispatchAsync(OutboxMessage message, CancellationToken ct)
    {
        var handler = _handlers.FirstOrDefault(x => x.CanHandle(message.Type));
        if (handler is null)
            throw new InvalidOperationException($"Unsupported outbox message type: {message.Type}");

        await handler.HandleAsync(message, ct);
    }
}