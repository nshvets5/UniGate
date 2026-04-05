using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Devices.Application.Scan;

namespace UniGate.Api.Controllers;

[Route("api/device/readers")]
[AllowAnonymous]
public sealed class DeviceScanController : ApiControllerBase
{
    private readonly ReaderScanUseCase _scan;

    public DeviceScanController(ReaderScanUseCase scan, IApiErrorMapper mapper) : base(mapper)
    {
        _scan = scan;
    }

    public sealed record ScanRequest(string CredentialType, string CredentialValue);

    [HttpPost("{readerId:guid}/scan")]
    public async Task<IActionResult> Scan([FromRoute] Guid readerId, [FromBody] ScanRequest req, CancellationToken ct)
        => ToActionResult(await _scan.ExecuteAsync(
            new ReaderScanCommand(readerId, req.CredentialType, req.CredentialValue), ct));
}