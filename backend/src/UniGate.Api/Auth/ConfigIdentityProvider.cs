using UniGate.SharedKernel.Auth;

namespace UniGate.Api.Auth;

public sealed class ConfigIdentityProvider : IIdentityProvider
{
    public string Name { get; }

    public ConfigIdentityProvider(IConfiguration configuration)
    {
        Name = configuration["Auth:ProviderName"] ?? "";
        if (string.IsNullOrWhiteSpace(Name))
            throw new InvalidOperationException("Auth:ProviderName is not configured.");
    }
}
