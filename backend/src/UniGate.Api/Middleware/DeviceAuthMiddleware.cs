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

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                var res = await store.FindByApiKeyAsync(apiKey);

                if (res.IsSuccess && res.Value.IsActive)
                {
                    context.Items["device"] = new DeviceAuthContext(
                        res.Value.ReaderId,
                        res.Value.Code);
                }
            }
        }

        await _next(context);
    }
}