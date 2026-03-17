using System.Text;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SendHealthAlertUseCase
{
    private readonly SystemNotificationsService _system;

    public SendHealthAlertUseCase(SystemNotificationsService system)
    {
        _system = system;
    }

    public Task<Result<int>> ExecuteAsync(HealthAlertRaisedPayload payload, CancellationToken ct = default)
    {
        var subject = $"[UniGate][HEALTH] {payload.CheckName} = {payload.Status}";

        var sb = new StringBuilder();
        sb.AppendLine("System health alert raised.");
        sb.AppendLine();
        sb.AppendLine($"Check: {payload.CheckName}");
        sb.AppendLine($"Status: {payload.Status}");
        sb.AppendLine($"Description: {payload.Description}");
        sb.AppendLine($"Occurred at (UTC): {payload.OccurredAt:O}");

        return _system.SendToAdminsAsync(subject, sb.ToString(), isHtml: false, ct);
    }
}