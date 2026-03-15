using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Iam.Application.IdentityEmails;

namespace UniGate.Api.Controllers;

[Route("api/me")]
[Authorize]
public sealed class MeEmailController : ApiControllerBase
{
    private readonly ResendMyVerificationEmailUseCase _resendVerification;
    private readonly SendMyPasswordResetEmailUseCase _sendPasswordReset;

    public MeEmailController(
        ResendMyVerificationEmailUseCase resendVerification,
        SendMyPasswordResetEmailUseCase sendPasswordReset,
        IApiErrorMapper mapper) : base(mapper)
    {
        _resendVerification = resendVerification;
        _sendPasswordReset = sendPasswordReset;
    }

    [HttpPost("email/resend-verification")]
    public async Task<IActionResult> ResendVerification(CancellationToken ct)
        => ToActionResult(await _resendVerification.ExecuteAsync(ct));

    [HttpPost("password/send-reset")]
    public async Task<IActionResult> SendPasswordReset(CancellationToken ct)
        => ToActionResult(await _sendPasswordReset.ExecuteAsync(ct));
}