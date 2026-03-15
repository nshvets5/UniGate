using UniGate.Iam.Application.Abstractions;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.IdentityEmails;

public sealed class SendMyPasswordResetEmailUseCase
{
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityEmailActions _actions;

    public SendMyPasswordResetEmailUseCase(
        ICurrentUser currentUser,
        IIdentityEmailActions actions)
    {
        _currentUser = currentUser;
        _actions = actions;
    }

    public Task<Result> ExecuteAsync(CancellationToken ct = default)
    {
        if (!_currentUser.IsAuthenticated)
            return Task.FromResult(Result.Failure(new Error("auth.unauthorized", "User is not authenticated.")));

        if (string.IsNullOrWhiteSpace(_currentUser.Subject))
            return Task.FromResult(Result.Failure(new Error("auth.subject_missing", "User subject is missing in token.")));

        return _actions.SendPasswordResetEmailAsync(_currentUser.Subject, ct);
    }
}