using System.Text.Json;
using UniGate.Notifications.Application;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Notifications;

public sealed class SuspiciousAccessDetectedHandler : IOutboxMessageHandler
{
    private readonly SendSuspiciousAccessAlertUseCase _notifier;

    public SuspiciousAccessDetectedHandler(SendSuspiciousAccessAlertUseCase notifier)
    {
        _notifier = notifier;
    }

    public bool CanHandle(string messageType)
        => messageType == TimetableOutboxTypes.SuspiciousAccessDetected;

    public async Task HandleAsync(OutboxMessage message, CancellationToken ct)
    {
        var payload = JsonSerializer.Deserialize<SuspiciousAccessDetectedPayload>(message.PayloadJson)
                      ?? throw new InvalidOperationException("Invalid suspicious access payload.");

        await _notifier.ExecuteAsync(payload, ct);
    }
}