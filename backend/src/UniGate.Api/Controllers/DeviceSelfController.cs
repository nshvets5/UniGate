using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Devices.Application.DeviceSelf;

namespace UniGate.Api.Controllers;

[Route("api/device")]
public sealed class DeviceSelfController : ApiControllerBase
{
    private readonly GetDeviceSelfUseCase _me;
    private readonly SendDeviceHeartbeatUseCase _heartbeat;
    private readonly ListDeviceOwnAttemptsUseCase _attempts;
    private readonly GetDeviceDashboardUseCase _dashboard;

    public DeviceSelfController(
        GetDeviceSelfUseCase me,
        SendDeviceHeartbeatUseCase heartbeat,
        ListDeviceOwnAttemptsUseCase attempts,
        GetDeviceDashboardUseCase dashboard,
        IApiErrorMapper mapper) : base(mapper)
    {
        _me = me;
        _heartbeat = heartbeat;
        _attempts = attempts;
        _dashboard = dashboard;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
        => ToActionResult(await _me.ExecuteAsync(ct));

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat(CancellationToken ct)
        => ToActionResult(await _heartbeat.ExecuteAsync(ct));

    [HttpGet("me/attempts")]
    public async Task<IActionResult> MyAttempts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => ToActionResult(await _attempts.ExecuteAsync(page, pageSize, ct));

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(
        [FromQuery] int recentTake = 10,
        CancellationToken ct = default)
        => ToActionResult(await _dashboard.ExecuteAsync(recentTake, ct));
}