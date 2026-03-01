using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Groups;
using UniGate.Directory.Application.Groups.UseCases;

namespace UniGate.Api.Controllers;

[Route("api/groups")]
public sealed class GroupsController : ApiControllerBase
{
    private readonly CreateGroupUseCase _create;
    private readonly ListGroupsUseCase _list;
    private readonly GetGroupByIdUseCase _get;
    private readonly UpdateGroupUseCase _update;
    private readonly SetGroupActiveUseCase _setActive;

    public GroupsController(
        CreateGroupUseCase create,
        ListGroupsUseCase list,
        GetGroupByIdUseCase get,
        UpdateGroupUseCase update,
        SetGroupActiveUseCase setActive,
        IApiErrorMapper mapper)
        : base(mapper)
    {
        _create = create;
        _list = list;
        _get = get;
        _update = update;
        _setActive = setActive;
    }

    [HttpPost]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> Create([FromBody] CreateGroupCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var q = new ListGroupsQuery(search, isActive, page, pageSize);
        return ToActionResult(await _list.ExecuteAsync(q, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken ct)
    => ToActionResult(await _get.ExecuteAsync(new GetGroupByIdQuery(id), ct));

    [HttpPut("{id:guid}")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateGroupCommand body, CancellationToken ct)
    {
        var cmd = body with { Id = id };
        return ToActionResult(await _update.ExecuteAsync(cmd, ct));
    }

    public sealed record SetGroupActiveRequest(bool IsActive);
    [HttpPatch("{id:guid}/active")]
    [Authorize(Policy = DirectoryAuthorizationExtensions.DirectoryAdmin)]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetGroupActiveRequest req, CancellationToken ct)
    => ToActionResult(await _setActive.ExecuteAsync(new SetGroupActiveCommand(id, req.IsActive), ct));
}