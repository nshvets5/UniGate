using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.Me;

public sealed class GetMySecurityUseCase
{
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;

    public GetMySecurityUseCase(
        ICurrentUser currentUser,
        IIdentityProvider identityProvider)
    {
        _currentUser = currentUser;
        _identityProvider = identityProvider;
    }

    public Task<Result<MeSecurityDto>> ExecuteAsync(CancellationToken ct = default)
    {
        if (!_currentUser.IsAuthenticated)
        {
            return Task.FromResult(Result<MeSecurityDto>.Success(
                new MeSecurityDto(
                    IsAuthenticated: false,
                    Subject: null,
                    Provider: _identityProvider.Name,
                    Email: null,
                    EmailVerified: false,
                    AvailableActions: new MeSecurityAvailableActionsDto(
                        CanResendVerificationEmail: false,
                        CanSendPasswordResetEmail: false))));
        }

        var emailVerified = ResolveEmailVerified();

        var dto = new MeSecurityDto(
            IsAuthenticated: true,
            Subject: _currentUser.Subject,
            Provider: _identityProvider.Name,
            Email: _currentUser.Email,
            EmailVerified: emailVerified,
            AvailableActions: new MeSecurityAvailableActionsDto(
                CanResendVerificationEmail: !emailVerified && !string.IsNullOrWhiteSpace(_currentUser.Subject),
                CanSendPasswordResetEmail: !string.IsNullOrWhiteSpace(_currentUser.Subject)));

        return Task.FromResult(Result<MeSecurityDto>.Success(dto));
    }

    private bool ResolveEmailVerified()
    {
        if (_currentUser is ICurrentUserEmailVerification emailVerificationAware)
            return emailVerificationAware.EmailVerified;

        return false;
    }
}