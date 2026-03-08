using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application;
using UniGate.Timetable.Application.Import;
using UniGate.Timetable.Infrastructure.Import.Csv;
using UniGate.Timetable.Infrastructure.Import.Ics;

namespace UniGate.Api.Controllers;

[Route("api/timetable")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableController : ApiControllerBase
{
    private readonly ITimetableStore _store;
    private readonly SyncTimetableToAccessUseCase _sync;
    private readonly ImportTimetableUseCase _import;

    private readonly PreviewTimetableImportUseCase _preview;
    private readonly ITimetableImportSourceParserResolver _parserResolver;
    private readonly ApplyImportPreviewUseCase _applyPreview;

    public TimetableController(
        ITimetableStore store,
        SyncTimetableToAccessUseCase sync,
        ImportTimetableUseCase import,
        PreviewTimetableImportUseCase preview,
        ITimetableImportSourceParserResolver parserResolver,
        ApplyImportPreviewUseCase applyPreview,
        IApiErrorMapper mapper) : base(mapper)
    {
        _store = store;
        _sync = sync;
        _import = import;
        _preview = preview;
        _parserResolver = parserResolver;
        _applyPreview = applyPreview;
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

        var parserRes = _parserResolver.Resolve("csv");
        if (!parserRes.IsSuccess)
            return ToActionResult(parserRes);

        await using var stream = file.OpenReadStream();

        var result = await _import.ExecuteAsync(
            parser: parserRes.Value,
            request: new TimetableParseRequest(
                FileStream: stream,
                SourceFileName: file.FileName,
                DefaultGroupId: null,
                FromDate: null,
                RangeDays: null,
                TimeZoneId: null),
            ct: ct);

        return ToActionResult(result);
    }

    [HttpPost("import/csv/preview")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> PreviewCsv(
    [FromForm] ImportFileRequest req,
    CancellationToken ct)
    {
        var file = req.File;

        if (file is null || file.Length == 0)
            return ToActionResult(UniGate.SharedKernel.Results.Result.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed("File is required.")));

        var parserRes = _parserResolver.Resolve("csv");
        if (!parserRes.IsSuccess)
            return ToActionResult(parserRes);

        await using var stream = file.OpenReadStream();

        var result = await _preview.ExecuteAsync(
            parser: parserRes.Value,
            request: new TimetableParseRequest(
                FileStream: stream,
                SourceFileName: file.FileName,
                DefaultGroupId: null,
                FromDate: null,
                RangeDays: null,
                TimeZoneId: null),
            ct: ct);

        return ToActionResult(result);
    }

    public sealed record ApplyPreviewRequest(string PreviewToken);

    [HttpPost("import/apply")]
    public async Task<IActionResult> ApplyPreview([FromBody] ApplyPreviewRequest req, CancellationToken ct)
        => ToActionResult(await _applyPreview.ExecuteAsync(req.PreviewToken, ct));

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

        var parserRes = _parserResolver.Resolve("ics");
        if (!parserRes.IsSuccess)
            return ToActionResult(parserRes);

        await using var stream = file.OpenReadStream();

        var result = await _import.ExecuteAsync(
            parser: parserRes.Value,
            request: new TimetableParseRequest(
                FileStream: stream,
                SourceFileName: file.FileName,
                DefaultGroupId: groupId,
                FromDate: DateOnly.FromDateTime(DateTime.UtcNow),
                RangeDays: rangeDays,
                TimeZoneId: timeZoneId),
            ct: ct);

        return ToActionResult(result);
    }

    [HttpPost("import/ics/preview")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> PreviewIcs(
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

        var parserRes = _parserResolver.Resolve("ics");
        if (!parserRes.IsSuccess)
            return ToActionResult(parserRes);

        await using var stream = file.OpenReadStream();

        var result = await _preview.ExecuteAsync(
            parser: parserRes.Value,
            request: new TimetableParseRequest(
                FileStream: stream,
                SourceFileName: file.FileName,
                DefaultGroupId: groupId,
                FromDate: DateOnly.FromDateTime(DateTime.UtcNow),
                RangeDays: rangeDays,
                TimeZoneId: timeZoneId),
            ct: ct);

        return ToActionResult(result);
    }

    [HttpGet("batches")]
    public async Task<IActionResult> ListBatches([FromQuery] int take = 50, CancellationToken ct = default)
    => ToActionResult(await _store.ListBatchesAsync(Math.Clamp(take, 1, 200), ct));

    [HttpPost("batches/{batchId:guid}/activate")]
    public async Task<IActionResult> ActivateBatch([FromRoute] Guid batchId, CancellationToken ct)
        => ToActionResult(await _store.ActivateBatchAsync(batchId, ct));
}