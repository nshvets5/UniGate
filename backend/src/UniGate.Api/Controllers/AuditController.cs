using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Audit.Application.Read;

namespace UniGate.Api.Controllers;

[Route("api/audit/events")]
public sealed class AuditController : ApiControllerBase
{
    private readonly IAuditQuery _query;

    public AuditController(IAuditQuery query, IApiErrorMapper mapper)
        : base(mapper)
    {
        _query = query;
    }

    [HttpGet]
    [Authorize(Policy = AuditAuthorizationExtensions.SecurityOrAdminOnly)]
    public async Task<IActionResult> Get(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string? type,
        [FromQuery] string? actorSubject,
        [FromQuery] Guid? actorProfileId,
        [FromQuery] string? correlationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var q = new GetAuditEventsQuery(
            From: from,
            To: to,
            Type: type,
            ActorSubject: actorSubject,
            ActorProfileId: actorProfileId,
            CorrelationId: correlationId,
            Page: page,
            PageSize: pageSize);

        var result = await _query.GetEventsAsync(q, ct);
        return ToActionResult(result);
    }
}