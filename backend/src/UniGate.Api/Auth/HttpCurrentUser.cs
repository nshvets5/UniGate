using System.Security.Claims;
using UniGate.SharedKernel.Auth;

namespace UniGate.Api.Auth;

public sealed class HttpCurrentUser : ICurrentUser, ICurrentUserEmailVerification
{
    private readonly IHttpContextAccessor _accessor;

    public HttpCurrentUser(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    private ClaimsPrincipal? User => _accessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public string? Subject => User?.FindFirstValue("sub");

    public string? Email => User?.FindFirstValue("email");

    public string? DisplayName =>
        User?.FindFirstValue("name")
        ?? User?.FindFirstValue("preferred_username")
        ?? Email;

    public IReadOnlyList<string> Roles =>
        User is null
            ? Array.Empty<string>()
            : User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .Distinct()
                .ToList();

    public bool EmailVerified
    {
        get
        {
            var value = _accessor.HttpContext?.User?.FindFirst("email_verified")?.Value;
            return bool.TryParse(value, out var parsed) && parsed;
        }
    }
}
