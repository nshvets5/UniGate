using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Audit.Application;
using UniGate.Audit.Application.Write;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.Audit.Infrastructure.Stores;

namespace UniGate.Audit.Infrastructure.DependencyInjection;

public static class AuditModuleServiceCollectionExtensions
{
    public static IServiceCollection AddAuditModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException(
                "Connection string 'MainDb' is not configured. " +
                "Set it via .NET User Secrets or env var ConnectionStrings__MainDb.");

        services.AddDbContext<AuditDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "audit");
            });
        });

        services.AddScoped<IAuditStore, EfAuditStore>();
        services.AddScoped<WriteAuditEventUseCase>();

        return services;
    }
}
