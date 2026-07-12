using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.MobileCredentials;

public static class MobileCredentialTypes
{
    public const string MobileQr = "mobile_qr";
}

public sealed record IssuedMobileCredential(
    string Token,
    DateTimeOffset IssuedAt,
    DateTimeOffset ExpiresAt,
    DateTimeOffset RefreshAfter);

public sealed record ValidatedMobileCredential(
    Guid TokenId,
    Guid StudentId,
    Guid GroupId,
    DateTimeOffset IssuedAt,
    DateTimeOffset ExpiresAt);

public interface IMobileCredentialService
{
    Task<Result<IssuedMobileCredential>> IssueAsync(
        Guid studentId,
        CancellationToken ct = default);

    Task<Result<ValidatedMobileCredential>> ValidateAndConsumeAsync(
        string token,
        CancellationToken ct = default);
}