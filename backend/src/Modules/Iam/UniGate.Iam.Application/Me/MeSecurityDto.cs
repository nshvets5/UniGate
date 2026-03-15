namespace UniGate.Iam.Application.Me;

public sealed record MeSecurityAvailableActionsDto(
    bool CanResendVerificationEmail,
    bool CanSendPasswordResetEmail);

public sealed record MeSecurityDto(
    bool IsAuthenticated,
    string? Subject,
    string? Provider,
    string? Email,
    bool EmailVerified,
    MeSecurityAvailableActionsDto AvailableActions);