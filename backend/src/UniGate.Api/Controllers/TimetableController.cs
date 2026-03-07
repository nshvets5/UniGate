using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Ical.Net.Evaluation;
using Ical.Net.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Rooms;
using UniGate.Timetable.Application;

namespace UniGate.Api.Controllers;

[Route("api/timetable")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableController : ApiControllerBase
{
    private readonly ITimetableStore _store;
    private readonly SyncTimetableToAccessUseCase _sync;
    private readonly IRoomsStore _rooms;

    public TimetableController(ITimetableStore store, SyncTimetableToAccessUseCase sync, IRoomsStore rooms, IApiErrorMapper mapper)
        : base(mapper)
    {
        _store = store;
        _sync = sync;
        _rooms = rooms;
    }

    public sealed class ImportCsvRequest
    {
        public IFormFile File { get; set; } = default!;
    }

    [HttpPost("import/csv")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> ImportCsv([FromForm] ImportCsvRequest req, CancellationToken ct)
    {
        var file = req.File;

        if (file is null || file.Length == 0)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("File is required.")));

        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);

        var rows = new List<ImportSlotRow>();
        var lineNo = 0;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync(ct);
            lineNo++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            if (lineNo == 1 && line.Contains("groupId", StringComparison.OrdinalIgnoreCase))
                continue;

            var parts = line.Split(',');
            if (parts.Length < 5)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid",
                        $"Line {lineNo}: expected at least 5 columns (groupId,roomCode,dayIso,startTime,endTime).")));

            if (!Guid.TryParse(parts[0].Trim(), out var groupId))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid groupId.")));

            var roomCode = parts[1].Trim();
            if (string.IsNullOrWhiteSpace(roomCode))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: roomCode is required.")));

            var roomRes = await _rooms.GetByCodeAsync(roomCode, ct);
            if (!roomRes.IsSuccess)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.room_not_found",
                        $"Line {lineNo}: room '{roomCode}' not found.")));

            if (!roomRes.Value.IsActive)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.room_inactive",
                        $"Line {lineNo}: room '{roomCode}' is inactive.")));

            var zoneId = roomRes.Value.ZoneId;

            if (!int.TryParse(parts[2].Trim(), out var dayIso) || dayIso < 1 || dayIso > 7)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid dayIso (1..7).")));

            if (!TimeOnly.TryParse(parts[3].Trim(), out var start))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid startTime.")));

            if (!TimeOnly.TryParse(parts[4].Trim(), out var end))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid endTime.")));

            if (start == end)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: startTime and endTime cannot be equal.")));

            DateTimeOffset? validFrom = null;
            DateTimeOffset? validTo = null;

            if (parts.Length > 5 && !string.IsNullOrWhiteSpace(parts[5]) && DateTimeOffset.TryParse(parts[5].Trim(), out var vf))
                validFrom = vf;

            if (parts.Length > 6 && !string.IsNullOrWhiteSpace(parts[6]) && DateTimeOffset.TryParse(parts[6].Trim(), out var vt))
                validTo = vt;

            if (validFrom is not null && validTo is not null && validTo < validFrom)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: validTo must be >= validFrom.")));

            var title = parts.Length > 7 ? string.Join(',', parts.Skip(7)).Trim() : null;

            rows.Add(new ImportSlotRow(groupId, zoneId, dayIso, start, end, validFrom, validTo, title));
        }

        var res = await _store.ReplaceAllSlotsAsync(rows, ct);
        return ToActionResult(res);
    }

    [HttpPost("sync-now")]
    public async Task<IActionResult> SyncNow(CancellationToken ct)
        => ToActionResult(await _sync.ExecuteAsync(ct));

    [HttpGet("slots")]
    public async Task<IActionResult> ListSlots([FromQuery] int take = 200, CancellationToken ct = default)
        => ToActionResult(await _store.ListSlotsAsync(Math.Clamp(take, 1, 2000), ct));
    public sealed class ImportIcsRequest
    {
        public IFormFile File { get; set; } = default!;
    }

    [HttpPost("import/ics")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> ImportIcs([FromQuery] Guid groupId, [FromForm] ImportIcsRequest req, CancellationToken ct)
    {
        var file = req.File;
        
        if (groupId == Guid.Empty)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("groupId query parameter is required.")));

        if (file is null || file.Length == 0)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("File is required.")));

        var fromUtc = DateTimeOffset.UtcNow.Date;
        var toUtc = fromUtc.AddDays(120);

        string icsText;
        using (var stream = file.OpenReadStream())
        using (var reader = new StreamReader(stream))
        {
            icsText = await reader.ReadToEndAsync(ct);
        }

        Calendar calendar;
        try
        {
            var serializer = new CalendarSerializer();
            calendar = Calendar.Load(icsText);
        }
        catch (Exception ex)
        {
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                new UniGate.SharedKernel.Results.Error("timetable.ics_invalid", $"ICS parse error: {ex.Message}")));
        }

        TimeZoneInfo tz;
        try { tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Rome"); }
        catch { tz = TimeZoneInfo.Utc; }

        var rows = new List<ImportSlotRow>();

        foreach (var ev in calendar.Events ?? Enumerable.Empty<CalendarEvent>())
        {
            if (ev?.DtStart is null || ev.DtEnd is null)
                continue;

            var roomCode = ExtractRoomCode(ev.Location);
            if (string.IsNullOrWhiteSpace(roomCode))
            {
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.ics_missing_location",
                        $"Event '{ev.Summary ?? "(no summary)"}' has empty LOCATION (roomCode required).")));
            }

            var roomRes = await _rooms.GetByCodeAsync(roomCode, ct);
            if (!roomRes.IsSuccess)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.room_not_found",
                        $"Room '{roomCode}' not found (LOCATION='{ev.Location}').")));

            if (!roomRes.Value.IsActive)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.room_inactive",
                        $"Room '{roomCode}' is inactive.")));

            var zoneId = roomRes.Value.ZoneId;
            var title = string.IsNullOrWhiteSpace(ev.Summary) ? null : ev.Summary.Trim();

            IEnumerable<Occurrence> occurrences;
            try
            {
                var fromLocal = TimeZoneInfo.ConvertTimeFromUtc(fromUtc, tz);
                var toLocal = TimeZoneInfo.ConvertTimeFromUtc(toUtc, tz);

                var fromCal = new CalDateTime(fromLocal, "Europe/Rome");
                var toCal = new CalDateTime(toLocal, "Europe/Rome");

                occurrences = ev
                    .GetOccurrences(fromCal)
                    .TakeWhileBefore(toCal);
            }
            catch
            {
                occurrences = new[]
                {
                new Occurrence(ev, new Period(ev.DtStart, ev.DtEnd))
            };
            }

            foreach (var occ in occurrences)
            {
                var period = occ.Period;
                if (period is null)
                    continue;

                var start = period.StartTime?.Value;
                var end = period.EndTime?.Value;

                if (start is null || end is null)
                    continue;

                var startUtc = new DateTimeOffset(DateTime.SpecifyKind(start.Value, DateTimeKind.Local)).ToUniversalTime();
                var endUtc = new DateTimeOffset(DateTime.SpecifyKind(end.Value, DateTimeKind.Local)).ToUniversalTime();

                var startLocal = TimeZoneInfo.ConvertTime(startUtc, tz);
                var endLocal = TimeZoneInfo.ConvertTime(endUtc, tz);

                var dayIso = startLocal.DayOfWeek switch
                {
                    DayOfWeek.Monday => 1,
                    DayOfWeek.Tuesday => 2,
                    DayOfWeek.Wednesday => 3,
                    DayOfWeek.Thursday => 4,
                    DayOfWeek.Friday => 5,
                    DayOfWeek.Saturday => 6,
                    DayOfWeek.Sunday => 7,
                    _ => 0
                };

                if (dayIso == 0)
                    continue;

                var startTime = TimeOnly.FromDateTime(startLocal.DateTime);
                var endTime = TimeOnly.FromDateTime(endLocal.DateTime);

                if (startTime == endTime)
                    continue;

                rows.Add(new ImportSlotRow(
                    GroupId: groupId,
                    ZoneId: zoneId,
                    DayOfWeekIso: dayIso,
                    StartTime: startTime,
                    EndTime: endTime,
                    ValidFrom: null,
                    ValidTo: null,
                    Title: title
                ));
            }
        }

        if (rows.Count == 0)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                new UniGate.SharedKernel.Results.Error("timetable.ics_empty", "No valid events found in ICS.")));

        var res = await _store.ReplaceAllSlotsAsync(rows, ct);
        return ToActionResult(res);
    }

    private static string? ExtractRoomCode(string? location)
    {
        if (string.IsNullOrWhiteSpace(location))
            return null;

        var raw = location.Trim();

        var separators = new[] { ',', ';' };
        var first = raw.Split(separators, 2)[0].Trim();

        var code = first.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries)[0].Trim();

        return string.IsNullOrWhiteSpace(code) ? null : code;
    }
}