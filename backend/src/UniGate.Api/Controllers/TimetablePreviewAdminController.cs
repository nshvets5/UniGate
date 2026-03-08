using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Timetable.Application.Import;

namespace UniGate.Api.Controllers;

[Route("api/admin/timetable/preview")]
[Authorize(Policy = "AccessAdmin")]
public sealed class TimetablePreviewAdminController : ApiControllerBase
{
    private readonly IImportPreviewStore _store;

    public TimetablePreviewAdminController(
        IImportPreviewStore store,
        IApiErrorMapper mapper) : base(mapper)
    {
        _store = store;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var stats = await _store.GetStatsAsync(ct);
        return Ok(stats);
    }
}