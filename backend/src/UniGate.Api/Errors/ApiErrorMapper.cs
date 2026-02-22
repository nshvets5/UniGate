using UniGate.SharedKernel.Results;

namespace UniGate.Api.Errors;

public interface IApiErrorMapper
{
    (int StatusCode, string Type) Map(Error error);
}

public sealed class ApiErrorMapper : IApiErrorMapper
{
    public (int StatusCode, string Type) Map(Error error)
    {
        if (error.Code.StartsWith("auth."))
            return (StatusCodes.Status401Unauthorized, "https://httpstatuses.com/401");

        if (error.Code.StartsWith("validation."))
            return (StatusCodes.Status400BadRequest, "https://httpstatuses.com/400");

        if (error.Code.StartsWith("users."))
            return (StatusCodes.Status403Forbidden, "https://httpstatuses.com/403");

        if (error.Code.StartsWith("infra."))
            return (StatusCodes.Status500InternalServerError, "https://httpstatuses.com/500");

        return (StatusCodes.Status400BadRequest, "https://httpstatuses.com/400");
    }
}
