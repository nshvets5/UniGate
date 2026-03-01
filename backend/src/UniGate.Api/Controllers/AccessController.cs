using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Decision;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;

namespace UniGate.Api.Controllers;

[Route("api/access")]
public sealed class AccessController : ApiControllerBase
{
    private readonly CheckAccessUseCase _check;
    private readonly dynamic _ensureProfile; // ToDo

    public AccessController(CheckAccessUseCase check, /* EnsureMyProfileUseCase */ dynamic ensureProfile, IApiErrorMapper mapper)
        : base(mapper)
    {
        _check = check;
        _ensureProfile = ensureProfile;
    }

    public sealed record DecisionRequest(Guid DoorId);

    [HttpPost("decision")]
    [Authorize]
    public async Task<IActionResult> Decide([FromBody] DecisionRequest req, CancellationToken ct)
    {
        var profileRes = await _ensureProfile.ExecuteAsync(ct);
        if (!profileRes.IsSuccess)
            return ToActionResult(profileRes);

        Guid profileId = profileRes.Value.ProfileId;

        var result = await _check.ExecuteAsync(new CheckAccessCommand(req.DoorId, profileId), ct);
        return ToActionResult(result);
    }
}