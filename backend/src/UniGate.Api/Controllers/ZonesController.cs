using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Access.Application.Admin.UseCases;
using UniGate.Access.Application.Admin.UseCases.Zones;
using UniGate.Access.Application.Admin.Zones;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;

namespace UniGate.Api.Controllers;

[Route("api/zones")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class ZonesController : ApiControllerBase
{
    private readonly CreateZoneUseCase _create;
    private readonly ListZonesUseCase _list;
    private readonly GetZoneUseCase _get;
    private readonly UpdateZoneUseCase _update;
    private readonly SetZoneActiveUseCase _active;

    public ZonesController(
        CreateZoneUseCase create,
        ListZonesUseCase list,
        GetZoneUseCase get,
        UpdateZoneUseCase update,
        SetZoneActiveUseCase active,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _get = get;
        _update = update;
        _active = active;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateZoneCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        => ToActionResult(await _list.ExecuteAsync(search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get([FromRoute] Guid id, CancellationToken ct)
        => ToActionResult(await _get.ExecuteAsync(id, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateZoneCommand body, CancellationToken ct)
        => ToActionResult(await _update.ExecuteAsync(body with { Id = id }, ct));

    public sealed record SetActiveRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveRequest req, CancellationToken ct)
        => ToActionResult(await _active.ExecuteAsync(id, req.IsActive, ct));
}