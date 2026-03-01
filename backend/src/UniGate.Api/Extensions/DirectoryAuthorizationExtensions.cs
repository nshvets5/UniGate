namespace UniGate.Api.Extensions;

public static class DirectoryAuthorizationExtensions
{
    public const string DirectoryAdmin = "DirectoryAdmin";

    public static IServiceCollection AddDirectoryAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(DirectoryAdmin, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin", "Security");
            });
        });

        return services;
    }
}