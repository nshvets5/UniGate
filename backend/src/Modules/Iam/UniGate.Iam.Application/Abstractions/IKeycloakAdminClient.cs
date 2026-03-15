using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.Abstractions;

public interface IKeycloakAdminClient
{
    Task<Result> SendVerifyEmailAsync(
        string keycloakUserId,
        string? clientId,
        string? redirectUri,
        int? lifespanSeconds,
        CancellationToken ct = default);

    Task<Result> ExecuteActionsEmailAsync(
        string keycloakUserId,
        IReadOnlyList<string> actions,
        string? clientId,
        string? redirectUri,
        int? lifespanSeconds,
        CancellationToken ct = default);
}