using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Timetable.Application;
using UniGate.Timetable.Infrastructure.Persistence;
using UniGate.Timetable.Infrastructure.Stores;

namespace UniGate.Timetable.Infrastructure.DependencyInjection;

public static class TimetableModuleServiceCollectionExtensions
{
    public static IServiceCollection AddTimetableModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException(
                "Connection string 'MainDb' is not configured. Set ConnectionStrings__MainDb.");

        services.AddDbContext<TimetableDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "timetable");
            });
        });

        services.AddScoped<ITimetableStore, EfTimetableStore>();
        services.AddScoped<SyncTimetableToAccessUseCase>();

        return services;
    }
}