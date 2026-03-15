namespace UniGate.Iam.Infrastructure.Keycloak;

public sealed class KeycloakAdminOptions
{
    public string BaseUrl { get; set; } = default!;
    public string Realm { get; set; } = default!;

    public string TokenRealm { get; set; } = "master";
    public string ClientId { get; set; } = default!;
    public string ClientSecret { get; set; } = default!;

    public string? DefaultClientId { get; set; }
    public string? DefaultRedirectUri { get; set; }
}