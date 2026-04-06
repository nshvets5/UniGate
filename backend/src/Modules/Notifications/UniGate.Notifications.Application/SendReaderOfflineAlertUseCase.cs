using System.Text;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SendReaderOfflineAlertUseCase
{
    private readonly SystemNotificationsService _system;

    public SendReaderOfflineAlertUseCase(SystemNotificationsService system)
    {
        _system = system;
    }

    public Task<Result<int>> ExecuteAsync(ReaderOfflineDetectedPayload payload, CancellationToken ct = default)
    {
        var subject = $"[UniGate][DEVICE] Reader offline: {payload.ReaderCode}";

        var sb = new StringBuilder();
        sb.AppendLine("Reader offline alert detected.");
        sb.AppendLine();
        sb.AppendLine($"ReaderId: {payload.ReaderId}");
        sb.AppendLine($"ReaderCode: {payload.ReaderCode}");
        sb.AppendLine($"ReaderName: {payload.ReaderName}");
        sb.AppendLine($"DoorId: {payload.DoorId}");
        sb.AppendLine($"LastSeenAt (UTC): {(payload.LastSeenAt is null ? "(never)" : payload.LastSeenAt.Value.ToString("O"))}");
        sb.AppendLine($"DetectedAt (UTC): {payload.DetectedAt:O}");

        return _system.SendToAdminsAsync(subject, sb.ToString(), isHtml: false, ct);
    }
}