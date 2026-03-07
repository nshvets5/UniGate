using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Errors;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.Controllers.Base;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    private readonly IApiErrorMapper _errorMapper;

    protected ApiControllerBase(IApiErrorMapper errorMapper)
    {
        _errorMapper = errorMapper;
    }

    protected IActionResult ToActionResult(Result result)
        => result.IsSuccess ? NoContent() : ToProblem(result.Error);

    protected IActionResult ToActionResult<T>(Result<T> result)
        => result.IsSuccess ? Ok(result.Value) : ToProblem(result.Error);

    protected IActionResult ToProblem(Error error)
    {
        var (status, type) = _errorMapper.Map(error);

        return Problem(
            type: type,
            title: error.Code,
            detail: error.Message,
            statusCode: status
            //extensions: new Dictionary<string, object?>
            //{
            //    ["traceId"] = HttpContext.TraceIdentifier
            //}
            );
    }
}
