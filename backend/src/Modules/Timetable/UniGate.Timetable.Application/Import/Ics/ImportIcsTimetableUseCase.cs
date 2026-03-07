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

    public ImportIcsTimetableUseCase(
        ITextFileReader fileReader,
        IIcsTimetableParser parser,
        IRoomLookup rooms,
        ITimetableStore store)
    {
        _fileReader = fileReader;
        _parser = parser;
        _rooms = rooms;
        _store = store;
    }

    public async Task<Result<int>> ExecuteAsync(
        Guid groupId,
        Stream fileStream,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default)
    {
        if (groupId == Guid.Empty)
            return Result<int>.Failure(Errors.Validation.Failed("groupId is required."));

        if (fileStream is null)
            return Result<int>.Failure(Errors.Validation.Failed("File stream is required."));

        if (rangeDays is < 7 or > 366)
            return Result<int>.Failure(Errors.Validation.Failed("rangeDays must be between 7 and 366."));

        if (string.IsNullOrWhiteSpace(timeZoneId))
            return Result<int>.Failure(Errors.Validation.Failed("timeZoneId is required."));

        var fileText = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!fileText.IsSuccess)
            return Result<int>.Failure(fileText.Error);

        var parsed = await _parser.ParseAsync(fileText.Value, fromDate, rangeDays, timeZoneId, ct);
        if (!parsed.IsSuccess)
            return Result<int>.Failure(parsed.Error);

        if (parsed.Value.Count == 0)
            return Result<int>.Failure(new Error("timetable.ics_empty", "No valid events found in ICS."));

        var rows = new List<ImportSlotRow>(parsed.Value.Count);

        foreach (var s in parsed.Value)
        {
            if (string.IsNullOrWhiteSpace(s.RoomCode))
                return Result<int>.Failure(new Error("timetable.ics_missing_location", "RoomCode is missing."));

            var roomRes = await _rooms.FindByCodeAsync(s.RoomCode, ct);
            if (!roomRes.IsSuccess)
                return Result<int>.Failure(new Error("timetable.room_not_found", $"Room '{s.RoomCode}' not found."));

            if (!roomRes.Value.IsActive)
                return Result<int>.Failure(new Error("timetable.room_inactive", $"Room '{s.RoomCode}' is inactive."));

            rows.Add(new ImportSlotRow(
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

        return await _store.ReplaceAllSlotsAsync(rows, ct);
    }
}