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

    public ImportCsvTimetableUseCase(
        ITextFileReader fileReader,
        ICsvTimetableParser parser,
        IRoomLookup rooms,
        ITimetableStore store)
    {
        _fileReader = fileReader;
        _parser = parser;
        _rooms = rooms;
        _store = store;
    }

    public async Task<Result<int>> ExecuteAsync(
        Stream fileStream,
        CancellationToken ct = default)
    {
        var textRes = await _fileReader.ReadAllTextAsync(fileStream, ct);
        if (!textRes.IsSuccess)
            return Result<int>.Failure(textRes.Error);

        var parsed = await _parser.ParseAsync(textRes.Value, ct);
        if (!parsed.IsSuccess)
            return Result<int>.Failure(parsed.Error);

        if (parsed.Value.Count == 0)
            return Result<int>.Failure(new Error("timetable.csv_empty", "CSV contains no rows."));

        var rows = new List<ImportSlotRow>();

        foreach (var s in parsed.Value)
        {
            var roomRes = await _rooms.FindByCodeAsync(s.RoomCode, ct);

            if (!roomRes.IsSuccess)
                return Result<int>.Failure(new Error(
                    "timetable.room_not_found",
                    $"Room '{s.RoomCode}' not found."));

            if (!roomRes.Value.IsActive)
                return Result<int>.Failure(new Error(
                    "timetable.room_inactive",
                    $"Room '{s.RoomCode}' is inactive."));

            rows.Add(new ImportSlotRow(
                s.GroupId,
                roomRes.Value.ZoneId,
                s.DayOfWeekIso,
                s.StartTime,
                s.EndTime,
                s.ValidFrom,
                s.ValidTo,
                s.Title));
        }

        return await _store.ReplaceAllSlotsAsync(rows, ct);
    }
}