using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Net.Http.Json;
using System.Text.Json;

namespace UniGate.Api.HealthChecks;

public sealed class KeycloakDiscoveryHealthCheck : IHealthCheck
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public KeycloakDiscoveryHealthCheck(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var authority = _configuration["Auth:Authority"];

        if (string.IsNullOrWhiteSpace(authority))
        {
            return HealthCheckResult.Unhealthy(
                description: "Auth:Authority is missing.",
                data: new Dictionary<string, object?> { ["Auth:Authority"] = authority });
        }

        authority = authority.TrimEnd('/');

        var discoveryUrl = $"{authority}/.well-known/openid-configuration";

        try
        {
            var client = _httpClientFactory.CreateClient("health");
            using var resp = await client.GetAsync(discoveryUrl, cancellationToken);

            if (!resp.IsSuccessStatusCode)
            {
                return HealthCheckResult.Unhealthy(
                    description: $"OIDC discovery returned {(int)resp.StatusCode}.",
                    data: new Dictionary<string, object?> { ["url"] = discoveryUrl, ["statusCode"] = (int)resp.StatusCode });
            }

            var json = await resp.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("issuer", out _))
            {
                return HealthCheckResult.Unhealthy(
                    description: "OIDC discovery JSON does not contain 'issuer'.",
                    data: new Dictionary<string, object?> { ["url"] = discoveryUrl });
            }

            return HealthCheckResult.Healthy(
                description: "Keycloak OIDC discovery is reachable.",
                data: new Dictionary<string, object?> { ["url"] = discoveryUrl });
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(
                description: "Failed to reach Keycloak OIDC discovery endpoint.",
                exception: ex,
                data: new Dictionary<string, object?> { ["url"] = discoveryUrl });
        }
    }
}
