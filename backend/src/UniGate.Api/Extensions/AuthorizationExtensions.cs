namespace UniGate.Api.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddAppAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly",
                policy => policy.RequireRole("Admin"));

            options.AddPolicy("SecurityOrAdmin",
                policy => policy.RequireRole("Security", "Admin"));
        });

        return services;
    }
}
