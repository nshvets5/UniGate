using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Iam.Application.Abstractions;

namespace UniGate.Api.Controllers;

[Route("api/admin/iam/email")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class IamEmailActionsController : ApiControllerBase
{
    private readonly IIdentityEmailActions _actions;

    public IamEmailActionsController(IIdentityEmailActions actions, IApiErrorMapper mapper) : base(mapper)
    {
        _actions = actions;
    }

    public sealed record EmailActionRequest(string KeycloakUserId);

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] EmailActionRequest req, CancellationToken ct)
        => ToActionResult(await _actions.ResendVerificationEmailAsync(req.KeycloakUserId, ct));

    [HttpPost("send-password-reset")]
    public async Task<IActionResult> SendPasswordReset([FromBody] EmailActionRequest req, CancellationToken ct)
        => ToActionResult(await _actions.SendPasswordResetEmailAsync(req.KeycloakUserId, ct));
}