using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text.Json;

namespace UniGate.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAppAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var authority = configuration["Auth:Authority"];
        var audience = configuration["Auth:Audience"];
        var requireHttps = bool.Parse(configuration["Auth:RequireHttpsMetadata"] ?? "true");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.RequireHttpsMetadata = requireHttps;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = authority,
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateLifetime = true
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var identity = context.Principal?.Identity as ClaimsIdentity;
                        if (identity == null)
                            return Task.CompletedTask;

                        var realmAccess = context.Principal?.FindFirst("realm_access")?.Value;

                        if (!string.IsNullOrWhiteSpace(realmAccess))
                        {
                            var roles = JsonDocument.Parse(realmAccess)
                                .RootElement
                                .GetProperty("roles")
                                .EnumerateArray();

                            foreach (var role in roles)
                            {
                                identity.AddClaim(new Claim(ClaimTypes.Role, role.GetString()!));
                            }
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
