using System.Text;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Results;

namespace UniGate.Notifications.Application;

public sealed class SendTimetableImportSummaryUseCase
{
    private readonly SystemNotificationsService _system;

    public SendTimetableImportSummaryUseCase(SystemNotificationsService system)
    {
        _system = system;
    }

    public Task<Result<int>> ExecuteAsync(TimetableImportCompletedPayload payload, CancellationToken ct = default)
    {
        var subject = $"[UniGate] Timetable import summary: {payload.SourceType.ToUpperInvariant()}";

        var sb = new StringBuilder();
        sb.AppendLine("Timetable import completed.");
        sb.AppendLine();
        sb.AppendLine($"Batch id: {payload.BatchId}");
        sb.AppendLine($"Source type: {payload.SourceType}");
        sb.AppendLine($"Source file: {payload.SourceFileName ?? "(unknown)"}");
        sb.AppendLine($"Imported by provider: {payload.ImportedByProvider ?? "(unknown)"}");
        sb.AppendLine($"Imported by subject: {payload.ImportedBySubject ?? "(unknown)"}");
        sb.AppendLine($"Total rows: {payload.TotalRows}");
        sb.AppendLine($"Imported rows: {payload.ImportedRows}");
        sb.AppendLine($"Skipped rows: {payload.SkippedRows}");
        sb.AppendLine($"Occurred at (UTC): {payload.OccurredAt:O}");

        return _system.SendToAdminsAsync(subject, sb.ToString(), isHtml: false, ct);
    }
}