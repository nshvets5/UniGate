using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Decision;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Security;

namespace UniGate.Api.Controllers;

[Route("api/access")]
public sealed class AccessController : ApiControllerBase
{
    private readonly CheckAccessUseCase _check;
    private readonly ICurrentProfileIdAccessor _profileId;

    public AccessController(CheckAccessUseCase check, ICurrentProfileIdAccessor profileId, IApiErrorMapper mapper)
        : base(mapper)
    {
        _check = check;
        _profileId = profileId;
    }

    public sealed record DecisionRequest(Guid DoorId);

    [HttpPost("decision")]
    [Authorize]
    public async Task<IActionResult> Decide([FromBody] DecisionRequest req, CancellationToken ct)
    {
        var profileRes = await _profileId.GetRequiredProfileIdAsync(ct);
        if (!profileRes.IsSuccess)
            return ToActionResult(profileRes);

        var result = await _check.ExecuteAsync(new CheckAccessCommand(req.DoorId, profileRes.Value), ct);
        return ToActionResult(result);
    }
}