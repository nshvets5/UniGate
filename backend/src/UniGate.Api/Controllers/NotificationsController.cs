using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Notifications.Application;

namespace UniGate.Api.Controllers;

[Route("api/notifications")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class NotificationsController : ApiControllerBase
{
    private readonly SendTestEmailUseCase _test;

    public NotificationsController(SendTestEmailUseCase test, IApiErrorMapper mapper) : base(mapper)
    {
        _test = test;
    }

    public sealed record SendTestEmailRequest(string ToEmail);

    [HttpPost("test-email")]
    public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailRequest req, CancellationToken ct)
        => ToActionResult(await _test.ExecuteAsync(req.ToEmail, ct));
}