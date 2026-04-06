using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Devices.Application.Attempts;

namespace UniGate.Api.Controllers;

[Authorize(Policy = AccessAuthorizationExtensions.AccessAdmin)]
public sealed class ReaderScanAttemptsController : ApiControllerBase
{
    private readonly ListReaderScanAttemptsUseCase _list;

    public ReaderScanAttemptsController(
        ListReaderScanAttemptsUseCase list,
        IApiErrorMapper mapper) : base(mapper)
    {
        _list = list;
    }

    [HttpGet("api/device/attempts")]
    public async Task<IActionResult> ListAll(
        [FromQuery] bool? isAllowed,
        [FromQuery] string? credentialType,
        [FromQuery] string? credentialValue,
        [FromQuery] DateTimeOffset? fromUtc,
        [FromQuery] DateTimeOffset? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var query = new ReaderScanAttemptsQuery(
            ReaderId: null,
            IsAllowed: isAllowed,
            CredentialType: credentialType,
            CredentialValue: credentialValue,
            FromUtc: fromUtc,
            ToUtc: toUtc,
            Page: page,
            PageSize: pageSize);

        return ToActionResult(await _list.ExecuteAsync(query, ct));
    }

    [HttpGet("api/readers/{readerId:guid}/attempts")]
    public async Task<IActionResult> ListByReader(
        [FromRoute] Guid readerId,
        [FromQuery] bool? isAllowed,
        [FromQuery] string? credentialType,
        [FromQuery] string? credentialValue,
        [FromQuery] DateTimeOffset? fromUtc,
        [FromQuery] DateTimeOffset? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var query = new ReaderScanAttemptsQuery(
            ReaderId: readerId,
            IsAllowed: isAllowed,
            CredentialType: credentialType,
            CredentialValue: credentialValue,
            FromUtc: fromUtc,
            ToUtc: toUtc,
            Page: page,
            PageSize: pageSize);

        return ToActionResult(await _list.ExecuteAsync(query, ct));
    }
}