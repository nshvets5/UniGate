using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Directory.Application.Me;
using UniGate.Iam.Application.UseCases.EnsureMyProfile;
using UniGate.Iam.Application.UseCases.GetCurrentUser;

namespace UniGate.Api.Controllers;

[Route("api/me")]
public sealed class MeController : ApiControllerBase
{
    private readonly GetCurrentUserUseCase _getCurrentUser;
    private readonly EnsureMyProfileUseCase _ensureMyProfile;
    private readonly GetMyStudentUseCase _myStudent;

    public MeController(
        GetCurrentUserUseCase getCurrentUser,
        EnsureMyProfileUseCase ensureMyProfile,
        GetMyStudentUseCase myStudent,
        IApiErrorMapper errorMapper)
        : base(errorMapper)
    {
        _getCurrentUser = getCurrentUser;
        _ensureMyProfile = ensureMyProfile;
        _myStudent = myStudent;
    }

    [HttpGet]
    [Authorize]
    public IActionResult Get()
        => ToActionResult(_getCurrentUser.Execute());

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> EnsureProfile(CancellationToken ct)
    => ToActionResult(await _ensureMyProfile.ExecuteAsync(ct));

    [HttpGet("student")]
    [Authorize]
    public async Task<IActionResult> GetMyStudent(CancellationToken ct)
    {
        var profileResult = await _ensureMyProfile.ExecuteAsync(ct);
        if (!profileResult.IsSuccess)
            return ToActionResult(profileResult);

        var profileId = profileResult.Value.ProfileId;

        var studentResult = await _myStudent.ExecuteAsync(new GetMyStudentQuery(profileId), ct);
        return ToActionResult(studentResult);
    }
}
