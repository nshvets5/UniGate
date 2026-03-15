using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.Abstractions;

public interface IIdentityEmailActions
{
    Task<Result> ResendVerificationEmailAsync(string keycloakUserId, CancellationToken ct = default);

    Task<Result> SendPasswordResetEmailAsync(string keycloakUserId, CancellationToken ct = default);
}