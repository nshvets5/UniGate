using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Csv;

public sealed class ImportCsvTimetableUseCase
{
    private readonly ITextFileReader _fileReader;
    private readonly ICsvTimetableParser _parser;
    private readonly IRoomLookup _rooms;
    private readonly ITimetableStore _store;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public ImportCsvTimetableUseCase(
        ITextFileReader fileReader,
        ICsvTimetableParser parser,
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
        Stream fileStream,
        CancellationToken ct = default)
    {
        var textRes = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!textRes.IsSuccess)
            return Result<ImportReport>.Failure(textRes.Error);

        var parsedRes = await _parser.ParseAsync(textRes.Value, ct);
        if (!parsedRes.IsSuccess)
            return Result<ImportReport>.Failure(parsedRes.Error);

        var parsed = parsedRes.Value;
        var issues = parsed.Issues.ToList();
        var validRows = new List<ImportSlotRow>();

        foreach (var s in parsed.Rows)
        {
            var roomRes = await _rooms.FindByCodeAsync(s.RoomCode, ct);

            if (!roomRes.IsSuccess)
            {
                issues.Add(new ImportIssue(s.LineNumber, "timetable.room_not_found", $"Room '{s.RoomCode}' not found."));
                continue;
            }

            if (!roomRes.Value.IsActive)
            {
                issues.Add(new ImportIssue(s.LineNumber, "timetable.room_inactive", $"Room '{s.RoomCode}' is inactive."));
                continue;
            }

            validRows.Add(new ImportSlotRow(
                s.GroupId,
                roomRes.Value.ZoneId,
                s.DayOfWeekIso,
                s.StartTime,
                s.EndTime,
                s.ValidFrom,
                s.ValidTo,
                s.Title));
        }

        var totalRows = parsed.Rows.Count + parsed.Issues.Count;

        if (validRows.Count > 0)
        {
            var storeRes = await _store.ImportBatchAsync(
                sourceType: "csv",
                sourceFileName: "csv-upload",
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