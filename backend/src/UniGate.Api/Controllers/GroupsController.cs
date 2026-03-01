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

    public GroupsController(
        CreateGroupUseCase create,
        ListGroupsUseCase list,
        IApiErrorMapper mapper)
        : base(mapper)
    {
        _create = create;
        _list = list;
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
}