namespace UniGate.Api.Extensions;

public static class AccessAuthorizationExtensions
{
    public const string AccessAdmin = "AccessAdmin";

    public static IServiceCollection AddAccessAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AccessAdmin, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin", "Security");
            });
        });

        return services;
    }
}