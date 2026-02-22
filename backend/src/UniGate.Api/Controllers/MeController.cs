using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Iam.Application.UseCases.EnsureMyProfile;
using UniGate.Iam.Application.UseCases.GetCurrentUser;

namespace UniGate.Api.Controllers;

[Route("api/me")]
public sealed class MeController : ApiControllerBase
{
    private readonly GetCurrentUserUseCase _getCurrentUser;
    private readonly EnsureMyProfileUseCase _ensureMyProfile;

    public MeController(
        GetCurrentUserUseCase getCurrentUser,
        EnsureMyProfileUseCase ensureMyProfile,
        IApiErrorMapper errorMapper)
        : base(errorMapper)
    {
        _getCurrentUser = getCurrentUser;
        _ensureMyProfile = ensureMyProfile;
    }

    [HttpGet]
    [Authorize]
    public IActionResult Get()
        => ToActionResult(_getCurrentUser.Execute());

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> EnsureProfile(CancellationToken ct)
    => ToActionResult(await _ensureMyProfile.ExecuteAsync(ct));
}
