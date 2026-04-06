using System.Text.Json;
using UniGate.Notifications.Application;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Notifications;

public sealed class TimetableImportCompletedHandler : IOutboxMessageHandler
{
    private readonly SendTimetableImportSummaryUseCase _notifier;

    public TimetableImportCompletedHandler(SendTimetableImportSummaryUseCase notifier)
    {
        _notifier = notifier;
    }

    public bool CanHandle(string messageType)
        => messageType == TimetableOutboxTypes.ImportCompleted;

    public async Task HandleAsync(OutboxMessage message, CancellationToken ct)
    {
        var payload = JsonSerializer.Deserialize<TimetableImportCompletedPayload>(message.PayloadJson)
                      ?? throw new InvalidOperationException("Invalid timetable import completed payload.");

        await _notifier.ExecuteAsync(payload, ct);
    }
}