using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Iam.Application.Abstractions;
using UniGate.Iam.Application.UseCases.EnsureMyProfile;
using UniGate.Iam.Application.UseCases.GetCurrentUser;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.Iam.Infrastructure.Stores;

namespace UniGate.Iam.Infrastructure.DependencyInjection;

public static class IamModuleServiceCollectionExtensions
{
    public static IServiceCollection AddIamModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");

        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException(
                "Connection string 'MainDb' is not configured. " +
                "Provide it via environment variable ConnectionStrings__MainDb or .NET User Secrets.");

        services.AddDbContext<IamDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(maxRetryCount: 5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "iam");
            });
        });

        services.AddScoped<IUserProfileStore, EfUserProfileStore>();

        services.AddScoped<GetCurrentUserUseCase>();
        services.AddScoped<EnsureMyProfileUseCase>();
        services.AddScoped<UniGate.Iam.Infrastructure.Outbox.IOutboxReader, UniGate.Iam.Infrastructure.Outbox.EfOutboxReader>();

        return services;
    }
}
