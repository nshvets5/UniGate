using UniGate.Api.Auth;
using UniGate.Devices.Application.Auth;

namespace UniGate.Api.Middleware;

public sealed class DeviceAuthMiddleware
{
    private readonly RequestDelegate _next;

    public DeviceAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context, IReaderAuthStore store)
    {
        if (context.Request.Path.StartsWithSegments("/api/device"))
        {
            var apiKey = context.Request.Headers["X-Device-Key"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Missing X-Device-Key header.");
                return;
            }

            var res = await store.FindByApiKeyAsync(apiKey, context.RequestAborted);

            if (!res.IsSuccess || !res.Value.IsActive)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid or inactive device key.");
                return;
            }

            context.Items["device"] = new DeviceAuthContext(
                res.Value.ReaderId,
                res.Value.Code);
        }

        await _next(context);
    }
}