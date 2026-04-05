using UniGate.SharedKernel.Auth;

namespace UniGate.Api.Auth;

public sealed class CurrentDevice : ICurrentDevice
{
    private readonly IHttpContextAccessor _http;

    public CurrentDevice(IHttpContextAccessor http)
    {
        _http = http;
    }

    public bool IsAuthenticated =>
        _http.HttpContext?.Items.ContainsKey("device") == true;

    public Guid? ReaderId =>
        (_http.HttpContext?.Items["device"] as DeviceAuthContext)?.ReaderId;

    public string? ReaderCode =>
        (_http.HttpContext?.Items["device"] as DeviceAuthContext)?.ReaderCode;
}

public sealed record DeviceAuthContext(Guid ReaderId, string ReaderCode);