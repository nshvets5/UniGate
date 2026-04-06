using System.Text.Json;
using UniGate.Notifications.Application;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Notifications;

public sealed class ReaderOfflineDetectedHandler : IOutboxMessageHandler
{
    private readonly SendReaderOfflineAlertUseCase _notifier;

    public ReaderOfflineDetectedHandler(SendReaderOfflineAlertUseCase notifier)
    {
        _notifier = notifier;
    }

    public bool CanHandle(string messageType)
        => messageType == TimetableOutboxTypes.ReaderOfflineDetected;

    public async Task HandleAsync(OutboxMessage message, CancellationToken ct)
    {
        var payload = JsonSerializer.Deserialize<ReaderOfflineDetectedPayload>(message.PayloadJson)
                      ?? throw new InvalidOperationException("Invalid reader offline payload.");

        await _notifier.ExecuteAsync(payload, ct);
    }
}