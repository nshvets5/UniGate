using UniGate.Iam.Application.Abstractions;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Observability;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.UseCases.EnsureMyProfile;

public sealed class EnsureMyProfileUseCase
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserProfileStore _store;
    private readonly IIdentityProvider _identityProvider;
    private readonly IRequestContext _requestContext;

    public EnsureMyProfileUseCase(
        ICurrentUser currentUser,
        IUserProfileStore store,
        IIdentityProvider identityProvider,
        IRequestContext requestContext)
    {
        _currentUser = currentUser;
        _store = store;
        _identityProvider = identityProvider;
        _requestContext = requestContext;
    }

    public async Task<Result<MyProfileDto>> ExecuteAsync(CancellationToken ct = default)
    {
        if (!_currentUser.IsAuthenticated)
            return Result<MyProfileDto>.Failure(Errors.Auth.Unauthorized);

        if (string.IsNullOrWhiteSpace(_currentUser.Subject))
            return Result<MyProfileDto>.Failure(Errors.Auth.MissingSubject);

        var ensured = await _store.EnsureAsync(
            provider: _identityProvider.Name,
            subject: _currentUser.Subject!,
            email: _currentUser.Email,
            displayName: _currentUser.DisplayName,
            requestContext: _requestContext,
            ct: ct);

        return ensured.Map(r => new MyProfileDto(
            ProfileId: r.ProfileId,
            Subject: _currentUser.Subject!,
            Email: _currentUser.Email,
            DisplayName: _currentUser.DisplayName,
            Roles: _currentUser.Roles));
    }
}
