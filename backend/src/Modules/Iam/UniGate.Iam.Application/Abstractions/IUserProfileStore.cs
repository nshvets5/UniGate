using UniGate.SharedKernel.Observability;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.Abstractions;

public interface IUserProfileStore
{
    Task<Result<EnsureUserProfileResult>> EnsureAsync(
        string provider,
        string subject,
        string? email,
        string? displayName,
        IRequestContext requestContext,
        CancellationToken ct = default);
}
