using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.Security;

public sealed class CurrentProfileIdAccessor : ICurrentProfileIdAccessor
{
    private readonly ICurrentUser _currentUser;
    private readonly IProfileLookup _lookup;

    public CurrentProfileIdAccessor(ICurrentUser currentUser, IProfileLookup lookup)
    {
        _currentUser = currentUser;
        _lookup = lookup;
    }

    public async Task<Result<Guid>> GetRequiredProfileIdAsync(CancellationToken ct = default)
    {
        var email = _currentUser.Email;
        if (string.IsNullOrWhiteSpace(email))
            return Result<Guid>.Failure(new Error("profile.email_missing", "Email claim is missing in access token."));

        var res = await _lookup.FindProfileIdByEmailAsync(email, ct);
        if (!res.IsSuccess)
            return Result<Guid>.Failure(res.Error);

        if (res.Value is not Guid id)
            return Result<Guid>.Failure(new Error(
                "profile.not_provisioned",
                "Profile is not provisioned yet. Call GET /api/me/profile once to create it, then retry."));

        return Result<Guid>.Success(id);
    }
}