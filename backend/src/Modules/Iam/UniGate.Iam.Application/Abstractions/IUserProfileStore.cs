using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.Abstractions;

public interface IUserProfileStore
{
    Task<Result<Guid>> EnsureAsync(
        string provider,
        string subject,
        string? email,
        string? displayName,
        CancellationToken ct = default);
}
