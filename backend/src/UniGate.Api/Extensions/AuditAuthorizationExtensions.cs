using Microsoft.AspNetCore.Authorization;

namespace UniGate.Api.Extensions;

public static class AuditAuthorizationExtensions
{
    public const string SecurityOrAdminOnly = "SecurityOrAdminOnly";

    public static IServiceCollection AddAuditAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(SecurityOrAdminOnly, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin", "Security");
            });
        });

        return services;
    }
}