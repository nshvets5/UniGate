using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.MobileCredentials;

public sealed record MobileCredentialTokenRecord(
    Guid TokenId,
    Guid StudentId,
    DateTimeOffset IssuedAt,
    DateTimeOffset ExpiresAt);

public interface IMobileCredentialTokenStore
{
    Task<Result> CreateAsync(
        MobileCredentialTokenRecord token,
        CancellationToken ct = default);

    Task<Result<bool>> ConsumeAsync(
        Guid tokenId,
        Guid studentId,
        DateTimeOffset nowUtc,
        CancellationToken ct = default);
}