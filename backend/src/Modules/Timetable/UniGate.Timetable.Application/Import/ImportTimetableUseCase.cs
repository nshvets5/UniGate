using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public sealed class ImportTimetableUseCase
{
    private readonly IRoomLookup _rooms;
    private readonly ITimetableStore _store;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public ImportTimetableUseCase(
        IRoomLookup rooms,
        ITimetableStore store,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider)
    {
        _rooms = rooms;
        _store = store;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
    }

    public async Task<Result<ImportReport>> ExecuteAsync(
        ITimetableImportSourceParser parser,
        TimetableParseRequest request,
        CancellationToken ct = default)
    {
        var parsedRes = await parser.ParseAsync(request, ct);
        if (!parsedRes.IsSuccess)
            return Result<ImportReport>.Failure(parsedRes.Error);

        var parsed = parsedRes.Value;

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

        if (validRows.Count > 0)
        {
            var importRes = await _store.ImportBatchAsync(
                sourceType: parsed.SourceType,
                sourceFileName: request.SourceFileName,
                importedByProvider: _identityProvider.Name,
                importedBySubject: _currentUser.Subject,
                rows: validRows,
                totalRows: totalRows,
                skippedRows: issues.Count,
                ct: ct);

            if (!importRes.IsSuccess)
                return Result<ImportReport>.Failure(importRes.Error);
        }

        var report = new ImportReport(
            TotalRows: totalRows,
            ImportedRows: validRows.Count,
            SkippedRows: issues.Count,
            Issues: issues);

        return Result<ImportReport>.Success(report);
    }
}