using UniGate.Iam.Application.Abstractions;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Application.IdentityEmails;

public sealed class IdentityEmailActionsService : IIdentityEmailActions
{
    private readonly IKeycloakAdminClient _keycloak;

    public IdentityEmailActionsService(IKeycloakAdminClient keycloak)
    {
        _keycloak = keycloak;
    }

    public Task<Result> ResendVerificationEmailAsync(string keycloakUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(keycloakUserId))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Keycloak user id is required.")));

        return _keycloak.SendVerifyEmailAsync(
            keycloakUserId: keycloakUserId,
            clientId: null,
            redirectUri: null,
            lifespanSeconds: null,
            ct: ct);
    }

    public Task<Result> SendPasswordResetEmailAsync(string keycloakUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(keycloakUserId))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Keycloak user id is required.")));

        return _keycloak.ExecuteActionsEmailAsync(
            keycloakUserId: keycloakUserId,
            actions: new[] { "UPDATE_PASSWORD" },
            clientId: null,
            redirectUri: null,
            lifespanSeconds: null,
            ct: ct);
    }
}