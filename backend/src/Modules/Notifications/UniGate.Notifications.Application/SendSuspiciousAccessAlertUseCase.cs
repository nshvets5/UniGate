using System.Text;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SendSuspiciousAccessAlertUseCase
{
    private readonly SystemNotificationsService _system;

    public SendSuspiciousAccessAlertUseCase(SystemNotificationsService system)
    {
        _system = system;
    }

    public Task<Result<int>> ExecuteAsync(SuspiciousAccessDetectedPayload payload, CancellationToken ct = default)
    {
        var subject = $"[UniGate][ALERT] Suspicious access detected: {payload.AlertCode}";

        var sb = new StringBuilder();
        sb.AppendLine("Suspicious access activity detected.");
        sb.AppendLine();
        sb.AppendLine($"Alert code: {payload.AlertCode}");
        sb.AppendLine($"Description: {payload.Description}");
        sb.AppendLine($"Credential: {payload.CredentialValue ?? "(unknown)"}");
        sb.AppendLine($"ReaderId: {payload.ReaderId}");
        sb.AppendLine($"DoorId: {payload.DoorId}");
        sb.AppendLine($"StudentId: {payload.StudentId}");
        sb.AppendLine($"Attempts: {payload.Attempts}");
        sb.AppendLine($"Occurred at (UTC): {payload.OccurredAt:O}");

        return _system.SendToAdminsAsync(subject, sb.ToString(), isHtml: false, ct);
    }
}