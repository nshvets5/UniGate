using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Timetable.Application.Diff;

namespace UniGate.Api.Controllers;

[Route("api/timetable/diff")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableDiffController : ApiControllerBase
{
    private readonly GetTimetableBatchDiffUseCase _diff;

    public TimetableDiffController(GetTimetableBatchDiffUseCase diff, IApiErrorMapper mapper)
        : base(mapper)
    {
        _diff = diff;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] Guid oldBatchId,
        [FromQuery] Guid newBatchId,
        CancellationToken ct = default)
        => ToActionResult(await _diff.ExecuteAsync(oldBatchId, newBatchId, ct));
}