using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Ics;

public sealed class ImportIcsTimetableUseCase
{
    private readonly ITextFileReader _fileReader;
    private readonly IIcsTimetableParser _parser;
    private readonly IRoomLookup _rooms;
    private readonly ITimetableStore _store;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public ImportIcsTimetableUseCase(
        ITextFileReader fileReader,
        IIcsTimetableParser parser,
        IRoomLookup rooms,
        ITimetableStore store,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider)
    {
        _fileReader = fileReader;
        _parser = parser;
        _rooms = rooms;
        _store = store;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
    }

    public async Task<Result<ImportReport>> ExecuteAsync(
        Guid groupId,
        Stream fileStream,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default)
    {
        if (groupId == Guid.Empty)
            return Result<ImportReport>.Failure(Errors.Validation.Failed("groupId is required."));

        if (fileStream is null)
            return Result<ImportReport>.Failure(Errors.Validation.Failed("File stream is required."));

        if (rangeDays is < 7 or > 366)
            return Result<ImportReport>.Failure(Errors.Validation.Failed("rangeDays must be between 7 and 366."));

        if (string.IsNullOrWhiteSpace(timeZoneId))
            return Result<ImportReport>.Failure(Errors.Validation.Failed("timeZoneId is required."));

        var fileText = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!fileText.IsSuccess)
            return Result<ImportReport>.Failure(fileText.Error);

        var parsed = await _parser.ParseAsync(fileText.Value, fromDate, rangeDays, timeZoneId, ct);
        if (!parsed.IsSuccess)
            return Result<ImportReport>.Failure(parsed.Error);

        var issues = parsed.Value.Issues.ToList();
        var validRows = new List<ImportSlotRow>();

        foreach (var s in parsed.Value.Rows)
        {
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
                GroupId: groupId,
                ZoneId: roomRes.Value.ZoneId,
                DayOfWeekIso: s.DayOfWeekIso,
                StartTime: s.StartTime,
                EndTime: s.EndTime,
                ValidFrom: null,
                ValidTo: null,
                Title: s.Title
            ));
        }

        var totalRows = parsed.Value.Rows.Count + parsed.Value.Issues.Count;

        if (validRows.Count > 0)
        {
            var storeRes = await _store.ImportBatchAsync(
                sourceType: "ics",
                sourceFileName: "ics-upload",
                importedByProvider: _identityProvider.Name,
                importedBySubject: _currentUser.Subject,
                rows: validRows,
                totalRows: totalRows,
                skippedRows: issues.Count,
                ct: ct);

            if (!storeRes.IsSuccess)
                return Result<ImportReport>.Failure(storeRes.Error);
        }

        var report = new ImportReport(
            TotalRows: totalRows,
            ImportedRows: validRows.Count,
            SkippedRows: issues.Count,
            Issues: issues);

        return Result<ImportReport>.Success(report);
    }
}