using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace UniGate.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var authority = configuration["Auth:Authority"]?.TrimEnd('/');
        var audience = configuration["Auth:Audience"];
        var requireHttps = configuration.GetValue("Auth:RequireHttpsMetadata", false);

        if (string.IsNullOrWhiteSpace(authority))
            throw new InvalidOperationException("Auth:Authority is not configured.");

        if (string.IsNullOrWhiteSpace(audience))
            throw new InvalidOperationException("Auth:Audience is not configured.");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.MetadataAddress = $"{authority}/.well-known/openid-configuration";
                options.RequireHttpsMetadata = requireHttps;
                options.IncludeErrorDetails = true;

                options.TokenHandlers.Clear();
                options.TokenHandlers.Add(new JsonWebTokenHandler());

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = new[] { authority },

                    ValidateAudience = true,
                    ValidAudiences = new[] { audience },

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2),
                    ValidateIssuerSigningKey = true,

                    NameClaimType = "preferred_username",
                    RoleClaimType = ClaimTypes.Role
                };
            });

        return services;
    }
}
