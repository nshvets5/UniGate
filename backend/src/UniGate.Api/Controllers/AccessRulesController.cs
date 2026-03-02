using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Admin;
using UniGate.Access.Application.Admin.Rules;
using UniGate.Access.Application.Admin.UseCases.Rules;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;

namespace UniGate.Api.Controllers;

[Route("api/access/rules")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class AccessRulesController : ApiControllerBase
{
    private readonly CreateRuleUseCase _create;
    private readonly ListRulesUseCase _list;
    private readonly SetRuleActiveUseCase _active;

    public AccessRulesController(
        CreateRuleUseCase create,
        ListRulesUseCase list,
        SetRuleActiveUseCase active,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _active = active;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRuleCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? zoneId,
        [FromQuery] Guid? groupId,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        => ToActionResult(await _list.ExecuteAsync(zoneId, groupId, isActive, page, pageSize, ct));

    public sealed record SetActiveRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveRequest req, CancellationToken ct)
        => ToActionResult(await _active.ExecuteAsync(id, req.IsActive, ct));
}