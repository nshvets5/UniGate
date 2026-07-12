using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Decision;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Security;
using UniGate.SharedKernel.Directory;

namespace UniGate.Api.Controllers;

[Route("api/access")]
public sealed class AccessController
    : ApiControllerBase
{
    private readonly CheckAccessUseCase _check;

    private readonly ICurrentProfileIdAccessor
        _profileId;

    private readonly IStudentLookup _students;

    public AccessController(
        CheckAccessUseCase check,
        ICurrentProfileIdAccessor profileId,
        IStudentLookup students,
        IApiErrorMapper mapper)
        : base(mapper)
    {
        _check = check;
        _profileId = profileId;
        _students = students;
    }

    public sealed record DecisionRequest(Guid DoorId);

    [HttpPost("decision")]
    [Authorize]
    public async Task<IActionResult> Decide(
        [FromBody] DecisionRequest req,
        CancellationToken ct)
    {
        var profileResult =
            await _profileId
                .GetRequiredProfileIdAsync(ct);

        if (!profileResult.IsSuccess)
            return ToActionResult(profileResult);

        var studentResult =
            await _students.FindByProfileIdAsync(
                profileResult.Value,
                ct);

        if (!studentResult.IsSuccess)
            return ToActionResult(studentResult);

        var result =
            await _check.ExecuteAsync(
                new CheckAccessCommand(
                    StudentId:
                        studentResult.Value.StudentId,
                    DoorId: req.DoorId),
                ct);

        return ToActionResult(result);
    }
}