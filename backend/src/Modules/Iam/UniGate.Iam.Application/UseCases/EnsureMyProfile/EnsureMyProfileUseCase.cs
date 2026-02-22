using UniGate.Iam.Application.Abstractions;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.UseCases.EnsureMyProfile;

public sealed class EnsureMyProfileUseCase
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserProfileStore _store;
    private readonly IIdentityProvider _identityProvider;

    public EnsureMyProfileUseCase(
        ICurrentUser currentUser,
        IUserProfileStore store,
        IIdentityProvider identityProvider)
    {
        _currentUser = currentUser;
        _store = store;
        _identityProvider = identityProvider;
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
            ct: ct);

        return ensured.Map(profileId => new MyProfileDto(
            ProfileId: profileId,
            Subject: _currentUser.Subject!,
            Email: _currentUser.Email,
            DisplayName: _currentUser.DisplayName,
            Roles: _currentUser.Roles));
    }
}
