using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Access.Application.Decision;
using UniGate.Access.Infrastructure.Decision;
using UniGate.Access.Infrastructure.Persistence;

namespace UniGate.Access.Infrastructure.DependencyInjection;

public static class AccessModuleServiceCollectionExtensions
{
    public static IServiceCollection AddAccessModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException(
                "Connection string 'MainDb' is not configured. Set ConnectionStrings__MainDb.");

        services.AddDbContext<AccessDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "access");
            });
        });

        services.AddScoped<IAccessDecisionStore, EfAccessDecisionStore>();
        services.AddScoped<CheckAccessUseCase>();

        return services;
    }
}