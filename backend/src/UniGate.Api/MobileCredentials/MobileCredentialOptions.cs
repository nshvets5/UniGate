namespace UniGate.Api.MobileCredentials;

public sealed class MobileCredentialOptions
{
    public const string SectionName = "MobileCredential";

    public string Issuer { get; init; } = "unigate-api";

    public string Audience { get; init; } = "unigate-reader";

    public string SigningKey { get; init; } = string.Empty;

    public int LifetimeSeconds { get; init; } = 60;

    public int RefreshAfterSeconds { get; init; } = 30;

    public int ClockSkewSeconds { get; init; } = 5;
}