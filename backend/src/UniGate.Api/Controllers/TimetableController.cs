using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Rooms;
using UniGate.Timetable.Application;
using UniGate.Timetable.Application.Import.Ics;

namespace UniGate.Api.Controllers;

[Route("api/timetable")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableController : ApiControllerBase
{
    private readonly ITimetableStore _store;
    private readonly SyncTimetableToAccessUseCase _sync;
    private readonly IRoomsStore _rooms;
    private readonly ImportIcsTimetableUseCase _importIcs;

    public TimetableController(
        ITimetableStore store,
        SyncTimetableToAccessUseCase sync,
        ImportIcsTimetableUseCase importIcs,
        IApiErrorMapper mapper) : base(mapper)
    {
        _store = store;
        _sync = sync;
        _importIcs = importIcs;
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
    public async Task<IActionResult> ImportIcs(
        [FromQuery] Guid groupId,
        [FromQuery] int rangeDays = 120,
        [FromQuery] string timeZoneId = "Europe/Rome",
        [FromForm] IFormFile file = null!,
        CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("File is required.")));

        await using var stream = file.OpenReadStream();

        var res = await _importIcs.ExecuteAsync(
            groupId: groupId,
            fileStream: stream,
            fromDate: DateOnly.FromDateTime(DateTime.UtcNow),
            rangeDays: rangeDays,
            timeZoneId: timeZoneId,
            ct: ct);

        return ToActionResult(res);
    }
}