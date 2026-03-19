using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Devices.Application.Readers;

namespace UniGate.Api.Controllers;

[Route("api/readers")]
[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class ReaderDevicesController : ApiControllerBase
{
    private readonly CreateReaderDeviceUseCase _create;
    private readonly ListReaderDevicesUseCase _list;
    private readonly GetReaderDeviceUseCase _get;
    private readonly UpdateReaderDeviceUseCase _update;
    private readonly SetReaderDeviceActiveUseCase _setActive;

    public ReaderDevicesController(
        CreateReaderDeviceUseCase create,
        ListReaderDevicesUseCase list,
        GetReaderDeviceUseCase get,
        UpdateReaderDeviceUseCase update,
        SetReaderDeviceActiveUseCase setActive,
        IApiErrorMapper mapper) : base(mapper)
    {
        _create = create;
        _list = list;
        _get = get;
        _update = update;
        _setActive = setActive;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReaderDeviceCommand cmd, CancellationToken ct)
        => ToActionResult(await _create.ExecuteAsync(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        => ToActionResult(await _list.ExecuteAsync(search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get([FromRoute] Guid id, CancellationToken ct)
        => ToActionResult(await _get.ExecuteAsync(id, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateReaderDeviceCommand body, CancellationToken ct)
        => ToActionResult(await _update.ExecuteAsync(body with { Id = id }, ct));

    public sealed record SetActiveReaderRequest(bool IsActive);

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive([FromRoute] Guid id, [FromBody] SetActiveReaderRequest req, CancellationToken ct)
        => ToActionResult(await _setActive.ExecuteAsync(id, req.IsActive, ct));
}