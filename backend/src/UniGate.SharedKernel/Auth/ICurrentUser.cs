namespace UniGate.SharedKernel.Auth;

public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    string? Subject { get; }

    string? Email { get; }
    string? DisplayName { get; }

    IReadOnlyList<string> Roles { get; }
}
