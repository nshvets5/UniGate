using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Directory.Application.Rooms;

namespace UniGate.Api.Controllers;

[Route("api/rooms")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class RoomsController : ApiControllerBase
{
    private readonly IRoomsStore _store;

    public RoomsController(IRoomsStore store, IApiErrorMapper mapper) : base(mapper)
    {
        _store = store;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoomCommand cmd, CancellationToken ct)
        => ToActionResult(await _store.CreateAsync(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        => ToActionResult(await _store.ListAsync(search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get([FromRoute] Guid id, CancellationToken ct)
        => ToActionResult(await _store.GetAsync(id, ct));

    [HttpGet("by-code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] string code, CancellationToken ct)
        => ToActionResult(await _store.GetByCodeAsync(code, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateRoomCommand body, CancellationToken ct)
        => ToActionResult(await _store.UpdateAsync(body with { Id = id }, ct));

    public sealed record SetActiveRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveRequest req, CancellationToken ct)
        => ToActionResult(await _store.SetActiveAsync(id, req.IsActive, ct));
}