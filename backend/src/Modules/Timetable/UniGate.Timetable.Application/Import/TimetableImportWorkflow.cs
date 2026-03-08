using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Diff;

namespace UniGate.Timetable.Application.Import;

public sealed class TimetableImportWorkflow
{
    private readonly IRoomLookup _rooms;
    private readonly ITimetablePreviewDiffService _diff;
    private readonly IImportPreviewStore _previewStore;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public TimetableImportWorkflow(
        IRoomLookup rooms,
        ITimetablePreviewDiffService diff,
        IImportPreviewStore previewStore,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider)
    {
        _rooms = rooms;
        _diff = diff;
        _previewStore = previewStore;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
    }

    public async Task<Result<ImportPreviewDto>> BuildPreviewAsync(
        TimetableParseResult parsed,
        string? sourceFileName,
        CancellationToken ct = default)
    {
        var issues = parsed.Issues.ToList();
        var validRows = new List<ImportSlotRow>();

        foreach (var s in parsed.Rows)
        {
            if (s.GroupId is null || s.GroupId == Guid.Empty)
            {
                issues.Add(new ImportIssue(s.SequenceNumber, "timetable.group_missing", "GroupId is missing."));
                continue;
            }

            var roomRes = await _rooms.FindByCodeAsync(s.RoomCode, ct);

            if (!roomRes.IsSuccess)
            {
                issues.Add(new ImportIssue(s.SequenceNumber, "timetable.room_not_found", $"Room '{s.RoomCode}' not found."));
                continue;
            }

            if (!roomRes.Value.IsActive)
            {
                issues.Add(new ImportIssue(s.SequenceNumber, "timetable.room_inactive", $"Room '{s.RoomCode}' is inactive."));
                continue;
            }

            validRows.Add(new ImportSlotRow(
                GroupId: s.GroupId.Value,
                ZoneId: roomRes.Value.ZoneId,
                DayOfWeekIso: s.DayOfWeekIso,
                StartTime: s.StartTime,
                EndTime: s.EndTime,
                ValidFrom: s.ValidFrom,
                ValidTo: s.ValidTo,
                Title: s.Title));
        }

        var totalRows = parsed.Rows.Count + parsed.Issues.Count;

        var diffRes = await _diff.DiffAgainstActiveAsync(validRows, ct);
        if (!diffRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(diffRes.Error);

        var payload = new PreviewPayload(
            SourceType: parsed.SourceType,
            SourceFileName: sourceFileName,
            ImportedByProvider: _identityProvider.Name,
            ImportedBySubject: _currentUser.Subject,
            Rows: validRows,
            TotalRows: totalRows,
            SkippedRows: issues.Count);

        var saveRes = await _previewStore.SaveAsync(payload, ct);
        if (!saveRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(saveRes.Error);

        var report = new ImportReport(
            TotalRows: totalRows,
            ImportedRows: validRows.Count,
            SkippedRows: issues.Count,
            Issues: issues);

        return Result<ImportPreviewDto>.Success(
            new ImportPreviewDto(
                PreviewToken: saveRes.Value,
                Report: report,
                Diff: diffRes.Value));
    }
}