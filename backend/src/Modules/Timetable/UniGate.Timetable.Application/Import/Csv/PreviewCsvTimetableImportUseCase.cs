using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Diff;

namespace UniGate.Timetable.Application.Import.Csv;

public sealed class PreviewCsvTimetableImportUseCase
{
    private readonly ITextFileReader _fileReader;
    private readonly ICsvTimetableParser _parser;
    private readonly IRoomLookup _rooms;
    private readonly ITimetablePreviewDiffService _diff;
    private readonly IImportPreviewStore _previewStore;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public PreviewCsvTimetableImportUseCase(
        ITextFileReader fileReader,
        ICsvTimetableParser parser,
        IRoomLookup rooms,
        ITimetablePreviewDiffService diff,
        IImportPreviewStore previewStore,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider)
    {
        _fileReader = fileReader;
        _parser = parser;
        _rooms = rooms;
        _diff = diff;
        _previewStore = previewStore;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
    }

    public async Task<Result<ImportPreviewDto>> ExecuteAsync(
        Stream fileStream,
        string? sourceFileName,
        CancellationToken ct = default)
    {
        var textRes = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!textRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(textRes.Error);

        var parsedRes = await _parser.ParseAsync(textRes.Value, ct);
        if (!parsedRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(parsedRes.Error);

        var issues = parsedRes.Value.Issues.ToList();
        var validRows = new List<ImportSlotRow>();

        foreach (var s in parsedRes.Value.Rows)
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

        var totalRows = parsedRes.Value.Rows.Count + parsedRes.Value.Issues.Count;

        var diffRes = await _diff.DiffAgainstActiveAsync(validRows, ct);
        if (!diffRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(diffRes.Error);

        var payload = new PreviewPayload(
            SourceType: "csv",
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