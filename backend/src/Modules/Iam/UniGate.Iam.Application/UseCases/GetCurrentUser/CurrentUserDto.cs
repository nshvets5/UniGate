namespace UniGate.Iam.Application.UseCases.GetCurrentUser;

public sealed record CurrentUserDto(
    string Subject,
    string? Email,
    string? DisplayName,
    IReadOnlyList<string> Roles);
