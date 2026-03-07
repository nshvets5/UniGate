using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import.Ics;

public sealed class ImportIcsTimetableUseCase
{
    private readonly IIcsTimetableParser _parser;
    private readonly IRoomLookup _rooms;
    private readonly ITimetableStore _store;

    public ImportIcsTimetableUseCase(IIcsTimetableParser parser, IRoomLookup rooms, ITimetableStore store)
    {
        _parser = parser;
        _rooms = rooms;
        _store = store;
    }

    public async Task<Result<int>> ExecuteAsync(
        Guid groupId,
        string icsText,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default)
    {
        if (groupId == Guid.Empty)
            return Result<int>.Failure(Errors.Validation.Failed("groupId is required."));

        if (string.IsNullOrWhiteSpace(icsText))
            return Result<int>.Failure(Errors.Validation.Failed("ICS content is empty."));

        if (rangeDays is < 7 or > 366)
            return Result<int>.Failure(Errors.Validation.Failed("rangeDays must be between 7 and 366."));

        var parsed = await _parser.ParseAsync(icsText, fromDate, rangeDays, timeZoneId, ct);
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