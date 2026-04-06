using System.Text.Json;
using UniGate.Notifications.Application;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Notifications;

public sealed class HealthAlertRaisedHandler : IOutboxMessageHandler
{
    private readonly SendHealthAlertUseCase _notifier;

    public HealthAlertRaisedHandler(SendHealthAlertUseCase notifier)
    {
        _notifier = notifier;
    }

    public bool CanHandle(string messageType)
        => messageType == TimetableOutboxTypes.HealthAlertRaised;

    public async Task HandleAsync(OutboxMessage message, CancellationToken ct)
    {
        var payload = JsonSerializer.Deserialize<HealthAlertRaisedPayload>(message.PayloadJson)
                      ?? throw new InvalidOperationException("Invalid health alert payload.");

        await _notifier.ExecuteAsync(payload, ct);
    }
}