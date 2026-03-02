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
    private readonly UpdateRuleScheduleUseCase _schedule;
    private readonly SetRuleActiveUseCase _active;

    public AccessRulesController(
        CreateRuleUseCase create,
        ListRulesUseCase list,
        UpdateRuleScheduleUseCase schedule,
        SetRuleActiveUseCase active,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _schedule = schedule;
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

    public sealed record UpdateScheduleRequest(
    int? DaysMask,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);

    [HttpPatch("{id:guid}/schedule")]
    public async Task<IActionResult> UpdateSchedule([FromRoute] Guid id, [FromBody] UpdateScheduleRequest req, CancellationToken ct)
    {
        var cmd = new UpdateRuleScheduleCommand(id, req.DaysMask, req.StartTime, req.EndTime, req.ValidFrom, req.ValidTo);
        return ToActionResult(await _schedule.ExecuteAsync(cmd, ct));
    }

    public sealed record SetActiveAccessRulesRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveAccessRulesRequest req, CancellationToken ct)
        => ToActionResult(await _active.ExecuteAsync(id, req.IsActive, ct));
}