using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Timetable.Application;
using UniGate.Timetable.Application.Diff;
using UniGate.Timetable.Application.Import;
using UniGate.Timetable.Application.Import.Csv;
using UniGate.Timetable.Application.Import.Ics;
using UniGate.Timetable.Infrastructure.Import;
using UniGate.Timetable.Infrastructure.Import.Csv;
using UniGate.Timetable.Infrastructure.Import.Ics;
using UniGate.Timetable.Infrastructure.Persistence;
using UniGate.Timetable.Infrastructure.Queries;
using UniGate.Timetable.Infrastructure.Stores;
using UniGate.Timetable.Infrastructure.Sync;

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

        services.Configure<TimetableSyncOptions>(configuration.GetSection("Timetable:Sync"));
        services.AddHostedService<TimetableAutoSyncHostedService>();

        services.AddSingleton<TimetableSyncStatus>();
        services.AddSingleton<TimetableSyncHealthCheck>();
        services.AddSingleton<TimetableSyncStatusEvaluator>();

        services.AddScoped<IIcsTimetableParser, IcalNetIcsTimetableParser>();
        services.AddScoped<ImportIcsTimetableUseCase>();
        services.AddScoped<ICsvTimetableParser, CsvTimetableParser>();
        services.AddScoped<ImportCsvTimetableUseCase>();

        services.AddScoped<ITimetableBatchDiffQuery, EfTimetableBatchDiffQuery>();
        services.AddScoped<GetTimetableBatchDiffUseCase>();

        services.AddSingleton<IImportPreviewStore, InMemoryImportPreviewStore>();
        services.AddScoped<ITimetablePreviewDiffService, EfTimetablePreviewDiffService>();

        services.AddScoped<PreviewCsvTimetableImportUseCase>();
        services.AddScoped<PreviewIcsTimetableImportUseCase>();
        services.AddScoped<ApplyImportPreviewUseCase>();

        return services;
    }
}