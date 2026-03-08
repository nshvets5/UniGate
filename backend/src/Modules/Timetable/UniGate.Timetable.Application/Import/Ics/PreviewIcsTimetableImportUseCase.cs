using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Diff;

namespace UniGate.Timetable.Application.Import.Ics;

public sealed class PreviewIcsTimetableImportUseCase
{
    private readonly ITextFileReader _fileReader;
    private readonly IIcsTimetableParser _parser;
    private readonly IRoomLookup _rooms;
    private readonly ITimetablePreviewDiffService _diff;
    private readonly IImportPreviewStore _previewStore;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public PreviewIcsTimetableImportUseCase(
        ITextFileReader fileReader,
        IIcsTimetableParser parser,
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
        Guid groupId,
        Stream fileStream,
        string? sourceFileName,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default)
    {
        if (groupId == Guid.Empty)
            return Result<ImportPreviewDto>.Failure(Errors.Validation.Failed("groupId is required."));

        if (fileStream is null)
            return Result<ImportPreviewDto>.Failure(Errors.Validation.Failed("File stream is required."));

        if (rangeDays is < 7 or > 366)
            return Result<ImportPreviewDto>.Failure(Errors.Validation.Failed("rangeDays must be between 7 and 366."));

        if (string.IsNullOrWhiteSpace(timeZoneId))
            return Result<ImportPreviewDto>.Failure(Errors.Validation.Failed("timeZoneId is required."));

        var fileText = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!fileText.IsSuccess)
            return Result<ImportPreviewDto>.Failure(fileText.Error);

        var parsed = await _parser.ParseAsync(fileText.Value, fromDate, rangeDays, timeZoneId, ct);
        if (!parsed.IsSuccess)
            return Result<ImportPreviewDto>.Failure(parsed.Error);

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

        var diffRes = await _diff.DiffAgainstActiveAsync(validRows, ct);
        if (!diffRes.IsSuccess)
            return Result<ImportPreviewDto>.Failure(diffRes.Error);

        var payload = new PreviewPayload(
            SourceType: "ics",
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