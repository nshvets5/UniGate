using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UniGate.Iam.Application.Abstractions;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Infrastructure.Keycloak;

public sealed class KeycloakAdminClient : IKeycloakAdminClient
{
    private readonly HttpClient _http;
    private readonly KeycloakAdminOptions _options;
    private readonly ILogger<KeycloakAdminClient> _logger;

    public KeycloakAdminClient(
        HttpClient http,
        IOptions<KeycloakAdminOptions> options,
        ILogger<KeycloakAdminClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<Result> SendVerifyEmailAsync(
        string keycloakUserId,
        string? clientId,
        string? redirectUri,
        int? lifespanSeconds,
        CancellationToken ct = default)
    {
        var tokenRes = await GetAccessTokenAsync(ct);
        if (!tokenRes.IsSuccess)
            return Result.Failure(tokenRes.Error);

        var query = BuildQuery(
            clientId ?? _options.DefaultClientId,
            redirectUri ?? _options.DefaultRedirectUri,
            lifespanSeconds);

        var url = $"{_options.BaseUrl.TrimEnd('/')}/admin/realms/{Uri.EscapeDataString(_options.Realm)}/users/{Uri.EscapeDataString(keycloakUserId)}/send-verify-email{query}";

        using var request = new HttpRequestMessage(HttpMethod.Put, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenRes.Value);

        return await SendNoContentExpectedAsync(request, "send verify email", ct);
    }

    public async Task<Result> ExecuteActionsEmailAsync(
        string keycloakUserId,
        IReadOnlyList<string> actions,
        string? clientId,
        string? redirectUri,
        int? lifespanSeconds,
        CancellationToken ct = default)
    {
        if (actions is null || actions.Count == 0)
            return Result.Failure(Errors.Validation.Failed("At least one action is required."));

        var tokenRes = await GetAccessTokenAsync(ct);
        if (!tokenRes.IsSuccess)
            return Result.Failure(tokenRes.Error);

        var query = BuildQuery(
            clientId ?? _options.DefaultClientId,
            redirectUri ?? _options.DefaultRedirectUri,
            lifespanSeconds);

        var url = $"{_options.BaseUrl.TrimEnd('/')}/admin/realms/{Uri.EscapeDataString(_options.Realm)}/users/{Uri.EscapeDataString(keycloakUserId)}/execute-actions-email{query}";

        using var request = new HttpRequestMessage(HttpMethod.Put, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenRes.Value);
        request.Content = new StringContent(
            JsonSerializer.Serialize(actions),
            Encoding.UTF8,
            "application/json");

        return await SendNoContentExpectedAsync(request, "execute actions email", ct);
    }

    private async Task<Result<string>> GetAccessTokenAsync(CancellationToken ct)
    {
        try
        {
            var url = $"{_options.BaseUrl.TrimEnd('/')}/realms/{Uri.EscapeDataString(_options.TokenRealm)}/protocol/openid-connect/token";

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = _options.ClientId,
                ["client_secret"] = _options.ClientSecret
            });

            using var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Keycloak token request failed: {Status} {Body}", (int)response.StatusCode, body);
                return Result<string>.Failure(new Error("keycloak.token_failed", "Failed to obtain Keycloak admin token."));
            }

            using var doc = JsonDocument.Parse(body);
            if (!doc.RootElement.TryGetProperty("access_token", out var tokenEl))
                return Result<string>.Failure(new Error("keycloak.token_missing", "Access token missing in Keycloak response."));

            var token = tokenEl.GetString();
            if (string.IsNullOrWhiteSpace(token))
                return Result<string>.Failure(new Error("keycloak.token_missing", "Access token is empty."));

            return Result<string>.Success(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Keycloak admin token");
            return Result<string>.Failure(Errors.Infrastructure.ExternalServiceUnavailable);
        }
    }

    private async Task<Result> SendNoContentExpectedAsync(HttpRequestMessage request, string operation, CancellationToken ct)
    {
        try
        {
            using var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
                return Result.Success();

            _logger.LogWarning("Keycloak {Operation} failed: {Status} {Body}", operation, (int)response.StatusCode, body);

            return response.StatusCode switch
            {
                System.Net.HttpStatusCode.BadRequest =>
                    Result.Failure(new Error("keycloak.bad_request", $"Keycloak rejected {operation} request.")),
                System.Net.HttpStatusCode.Forbidden =>
                    Result.Failure(new Error("keycloak.forbidden", "Keycloak admin client is not authorized.")),
                System.Net.HttpStatusCode.NotFound =>
                    Result.Failure(new Error("keycloak.user_not_found", "Keycloak user not found.")),
                _ =>
                    Result.Failure(new Error("keycloak.request_failed", $"Keycloak {operation} request failed."))
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Keycloak {Operation} request failed", operation);
            return Result.Failure(Errors.Infrastructure.ExternalServiceUnavailable);
        }
    }

    private static string BuildQuery(string? clientId, string? redirectUri, int? lifespanSeconds)
    {
        var items = new List<string>();

        if (!string.IsNullOrWhiteSpace(clientId))
            items.Add($"client_id={Uri.EscapeDataString(clientId)}");

        if (!string.IsNullOrWhiteSpace(redirectUri))
            items.Add($"redirect_uri={Uri.EscapeDataString(redirectUri)}");

        if (lifespanSeconds is not null)
            items.Add($"lifespan={lifespanSeconds.Value}");

        return items.Count == 0 ? string.Empty : "?" + string.Join("&", items);
    }
}