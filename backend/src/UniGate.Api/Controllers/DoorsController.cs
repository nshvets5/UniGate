using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Admin;
using UniGate.Access.Application.Admin.Doors;
using UniGate.Access.Application.Admin.UseCases.Doors;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;

namespace UniGate.Api.Controllers;

[Route("api/doors")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class DoorsController : ApiControllerBase
{
    private readonly CreateDoorUseCase _create;
    private readonly ListDoorsUseCase _list;
    private readonly GetDoorUseCase _get;
    private readonly UpdateDoorUseCase _update;
    private readonly SetDoorActiveUseCase _active;

    public DoorsController(
        CreateDoorUseCase create,
        ListDoorsUseCase list,
        GetDoorUseCase get,
        UpdateDoorUseCase update,
        SetDoorActiveUseCase active,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _get = get;
        _update = update;
        _active = active;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDoorCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? zoneId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        => ToActionResult(await _list.ExecuteAsync(zoneId, search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get([FromRoute] Guid id, CancellationToken ct)
        => ToActionResult(await _get.ExecuteAsync(id, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateDoorCommand body, CancellationToken ct)
        => ToActionResult(await _update.ExecuteAsync(body with { Id = id }, ct));

    public sealed record SetActiveDoorRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveDoorRequest req, CancellationToken ct)
        => ToActionResult(await _active.ExecuteAsync(id, req.IsActive, ct));
}