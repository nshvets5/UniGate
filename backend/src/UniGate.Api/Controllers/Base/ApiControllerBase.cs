using Microsoft.AspNetCore.Mvc;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.Controllers.Base;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult ToActionResult(Result result)
        => result.IsSuccess ? NoContent() : ToProblem(result.Error);

    protected IActionResult ToActionResult<T>(Result<T> result)
        => result.IsSuccess ? Ok(result.Value) : ToProblem(result.Error);

    protected IActionResult ToProblem(Error error)
    {
        var (status, type) = MapError(error);

        return Problem(
            type: type,
            title: error.Code,
            detail: error.Message,
            statusCode: status,
            extensions: new Dictionary<string, object?>
            {
                ["traceId"] = HttpContext.TraceIdentifier
            });
    }

    private static (int Status, string Type) MapError(Error error)
    {
        if (error.Code.StartsWith("auth."))
            return (StatusCodes.Status401Unauthorized, "https://httpstatuses.com/401");

        if (error.Code.StartsWith("validation."))
            return (StatusCodes.Status400BadRequest, "https://httpstatuses.com/400");

        if (error.Code.StartsWith("infra."))
            return (StatusCodes.Status500InternalServerError, "https://httpstatuses.com/500");

        return (StatusCodes.Status400BadRequest, "https://httpstatuses.com/400");
    }
}
