using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Timetable.Application;

namespace UniGate.Api.Controllers;

[Route("api/timetable")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableController : ApiControllerBase
{
    private readonly ITimetableStore _store;
    private readonly SyncTimetableToAccessUseCase _sync;

    public TimetableController(ITimetableStore store, SyncTimetableToAccessUseCase sync, IApiErrorMapper mapper)
        : base(mapper)
    {
        _store = store;
        _sync = sync;
    }

    public sealed class ImportCsvRequest
    {
        public IFormFile File { get; set; } = default!;
    }

    [HttpPost("import/csv")]
    [RequestSizeLimit(10_000_000)]
    [Consumes("multipart/form-data")]
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
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: expected at least 5 columns.")));

            if (!Guid.TryParse(parts[0].Trim(), out var groupId))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid groupId.")));

            if (!Guid.TryParse(parts[1].Trim(), out var zoneId))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid zoneId.")));

            if (!int.TryParse(parts[2].Trim(), out var dayIso) || dayIso < 1 || dayIso > 7)
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid dayIso (1..7).")));

            if (!TimeOnly.TryParse(parts[3].Trim(), out var start))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid startTime.")));

            if (!TimeOnly.TryParse(parts[4].Trim(), out var end))
                return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                    new UniGate.SharedKernel.Results.Error("timetable.csv_invalid", $"Line {lineNo}: invalid endTime.")));

            DateTimeOffset? validFrom = null;
            DateTimeOffset? validTo = null;

            if (parts.Length > 5 && !string.IsNullOrWhiteSpace(parts[5]) && DateTimeOffset.TryParse(parts[5].Trim(), out var vf))
                validFrom = vf;

            if (parts.Length > 6 && !string.IsNullOrWhiteSpace(parts[6]) && DateTimeOffset.TryParse(parts[6].Trim(), out var vt))
                validTo = vt;

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
}