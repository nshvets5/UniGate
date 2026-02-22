using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.UseCases.GetCurrentUser;

public sealed class GetCurrentUserUseCase
{
    private readonly ICurrentUser _currentUser;

    public GetCurrentUserUseCase(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public Result<CurrentUserDto> Execute()
    {
        if (!_currentUser.IsAuthenticated)
            return Result<CurrentUserDto>.Failure(Errors.Auth.Unauthorized);

        if (string.IsNullOrWhiteSpace(_currentUser.Subject))
            return Result<CurrentUserDto>.Failure(Errors.Auth.MissingSubject);

        return Result<CurrentUserDto>.Success(
            new CurrentUserDto(
                Subject: _currentUser.Subject!,
                Email: _currentUser.Email,
                DisplayName: _currentUser.DisplayName,
                Roles: _currentUser.Roles));
    }
}
