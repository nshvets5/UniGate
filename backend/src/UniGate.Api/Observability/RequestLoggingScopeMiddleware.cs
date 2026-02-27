using UniGate.SharedKernel.Auth;

namespace UniGate.Api.Observability;

public sealed class RequestLoggingScopeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingScopeMiddleware> _logger;

    public RequestLoggingScopeMiddleware(RequestDelegate next, ILogger<RequestLoggingScopeMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context, ICurrentUser currentUser)
    {
        var correlationId = context.Items.TryGetValue(CorrelationIdMiddleware.HeaderName, out var v)
            ? v?.ToString()
            : null;

        var scope = new Dictionary<string, object?>
        {
            ["traceId"] = context.TraceIdentifier,
            ["correlationId"] = correlationId,
            ["userSub"] = currentUser.Subject,
            ["path"] = context.Request.Path.Value,
            ["method"] = context.Request.Method
        };

        using (_logger.BeginScope(scope))
        {
            await _next(context);
        }
    }
}
