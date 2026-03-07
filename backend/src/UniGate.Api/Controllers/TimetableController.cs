using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Rooms;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application;
using UniGate.Timetable.Application.Import.Csv;
using UniGate.Timetable.Application.Import.Ics;

namespace UniGate.Api.Controllers;

[Route("api/timetable")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableController : ApiControllerBase
{
    private readonly ITimetableStore _store;
    private readonly SyncTimetableToAccessUseCase _sync;
    private readonly ImportCsvTimetableUseCase _importCsv;
    private readonly ImportIcsTimetableUseCase _importIcs;

    public TimetableController(
        ITimetableStore store,
        SyncTimetableToAccessUseCase sync,
        ImportCsvTimetableUseCase importCsv,
        ImportIcsTimetableUseCase importIcs,
        IApiErrorMapper mapper) : base(mapper)
    {
        _store = store;
        _sync = sync;
        _importCsv = importCsv;
        _importIcs = importIcs;
    }

    public sealed class ImportFileRequest
    {
        public IFormFile File { get; set; } = default!;
    }

    [HttpPost("import/csv")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> ImportCsv(
        [FromForm] ImportFileRequest req,
        CancellationToken ct)
    {
        var file = req.File;

        if (file is null || file.Length == 0)
            return ToActionResult(Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("File is required.")));

        await using var stream = file.OpenReadStream();

        var result = await _importCsv.ExecuteAsync(stream, ct);

        return ToActionResult(result);
    }
    [HttpPost("sync-now")]
    public async Task<IActionResult> SyncNow(CancellationToken ct)
        => ToActionResult(await _sync.ExecuteAsync(ct));

    [HttpGet("slots")]
    public async Task<IActionResult> ListSlots([FromQuery] int take = 200, CancellationToken ct = default)
        => ToActionResult(await _store.ListActiveSlotsAsync(Math.Clamp(take, 1, 2000), ct));

    [HttpPost("import/ics")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> ImportIcs(
        [FromQuery] Guid groupId,
        [FromQuery] int rangeDays = 120,
        [FromQuery] string timeZoneId = "Europe/Rome",
        [FromForm] ImportFileRequest req = null!,
        CancellationToken ct = default)
    {
        var file = req.File;

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

    [HttpGet("batches")]
    public async Task<IActionResult> ListBatches([FromQuery] int take = 50, CancellationToken ct = default)
    => ToActionResult(await _store.ListBatchesAsync(Math.Clamp(take, 1, 200), ct));

    [HttpPost("batches/{batchId:guid}/activate")]
    public async Task<IActionResult> ActivateBatch([FromRoute] Guid batchId, CancellationToken ct)
        => ToActionResult(await _store.ActivateBatchAsync(batchId, ct));
}