using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Timetable.Infrastructure.Sync;

namespace UniGate.Api.Controllers;

[Route("api/timetable/sync")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class TimetableSyncController : ApiControllerBase
{
    private readonly TimetableSyncStatusEvaluator _eval;

    public TimetableSyncController(TimetableSyncStatusEvaluator eval, IApiErrorMapper mapper)
        : base(mapper)
    {
        _eval = eval;
    }

    [HttpGet("status")]
    public IActionResult Status()
        => Ok(_eval.Evaluate());
}