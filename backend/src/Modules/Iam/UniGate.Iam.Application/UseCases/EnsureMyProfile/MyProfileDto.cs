namespace UniGate.Iam.Application.UseCases.EnsureMyProfile;

public sealed record MyProfileDto(
    Guid ProfileId,
    string Subject,
    string? Email,
    string? DisplayName,
    IReadOnlyList<string> Roles);
