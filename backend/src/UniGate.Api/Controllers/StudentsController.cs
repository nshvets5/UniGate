using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Students;
using UniGate.Directory.Application.Students.UseCases;

namespace UniGate.Api.Controllers;

[Route("api/students")]
public sealed class StudentsController : ApiControllerBase
{
    private readonly CreateStudentUseCase _create;
    private readonly ListStudentsUseCase _list;
    private readonly GetStudentByIdUseCase _get;
    private readonly UpdateStudentUseCase _update;
    private readonly SetStudentActiveUseCase _setActive;
    private readonly ChangeStudentGroupUseCase _changeGroup;
    private readonly BindStudentProfileUseCase _bindProfile;

    public StudentsController(
        CreateStudentUseCase create,
        ListStudentsUseCase list,
        GetStudentByIdUseCase get,
        UpdateStudentUseCase update,
        SetStudentActiveUseCase setActive,
        ChangeStudentGroupUseCase changeGroup,
        BindStudentProfileUseCase bindProfile,
        IApiErrorMapper mapper)
        : base(mapper)
    {
        _create = create;
        _list = list;
        _get = get;
        _update = update;
        _setActive = setActive;
        _changeGroup = changeGroup;
        _bindProfile = bindProfile;
    }

    [HttpPost]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> Create([FromBody] CreateStudentCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> List(
        [FromQuery] Guid? groupId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var q = new ListStudentsQuery(groupId, search, isActive, page, pageSize);
        return ToActionResult(await _list.ExecuteAsync(q, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken ct)
        => ToActionResult(await _get.ExecuteAsync(new GetStudentByIdQuery(id), ct));

    [HttpPut("{id:guid}")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateStudentCommand body, CancellationToken ct)
        => ToActionResult(await _update.ExecuteAsync(body with { Id = id }, ct));

    public sealed record SetStudentActiveRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetStudentActiveRequest req, CancellationToken ct)
        => ToActionResult(await _setActive.ExecuteAsync(new SetStudentActiveCommand(id, req.IsActive), ct));

    public sealed record ChangeGroupRequest(Guid GroupId);

    [HttpPatch("{id:guid}/group")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> ChangeGroup([FromRoute] Guid id, [FromBody] ChangeGroupRequest req, CancellationToken ct)
        => ToActionResult(await _changeGroup.ExecuteAsync(new ChangeStudentGroupCommand(id, req.GroupId), ct));

    public sealed record BindProfileRequest(Guid IamProfileId);

    [HttpPatch("{id:guid}/bind-profile")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> BindProfile([FromRoute] Guid id, [FromBody] BindProfileRequest req, CancellationToken ct)
        => ToActionResult(await _bindProfile.ExecuteAsync(new BindStudentProfileCommand(id, req.IamProfileId), ct));
}