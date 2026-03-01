using UniGate.SharedKernel.Observability;

namespace UniGate.Api.Observability;

public sealed class HttpRequestContext : IRequestContext
{
    private readonly IHttpContextAccessor _accessor;

    public HttpRequestContext(IHttpContextAccessor accessor) => _accessor = accessor;

    private HttpContext? Http => _accessor.HttpContext;

    public string? CorrelationId =>
        Http?.Items.TryGetValue("X-Correlation-Id", out var v) == true ? v?.ToString() : null;

    public string? TraceId => Http?.TraceIdentifier;

    public string? Ip => Http?.Connection.RemoteIpAddress?.ToString();

    public string? UserAgent => Http?.Request.Headers.UserAgent.ToString();
}
