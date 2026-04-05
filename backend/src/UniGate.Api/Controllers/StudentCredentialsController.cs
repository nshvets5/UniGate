using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Credentials;

namespace UniGate.Api.Controllers;

[Route("api/students/{studentId:guid}/credentials")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class StudentCredentialsController : ApiControllerBase
{
    private readonly CreateStudentCredentialUseCase _create;
    private readonly ListStudentCredentialsUseCase _list;
    private readonly SetStudentCredentialActiveUseCase _setActive;

    public StudentCredentialsController(
        CreateStudentCredentialUseCase create,
        ListStudentCredentialsUseCase list,
        SetStudentCredentialActiveUseCase setActive,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _setActive = setActive;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromRoute] Guid studentId, [FromBody] CreateStudentCredentialCommand body, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(body with { StudentId = studentId }, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromRoute] Guid studentId, CancellationToken ct)
        => ToActionResult(await _list.ExecuteAsync(studentId, ct));

    public sealed record SetActiveStudentCredentialRequest(bool IsActive);

    [HttpPatch("{credentialId:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid credentialId, [FromBody] SetActiveStudentCredentialRequest req, CancellationToken ct)
        => ToActionResult(await _setActive.ExecuteAsync(credentialId, req.IsActive, ct));
}