using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Devices.Application.Readers;
using UniGate.Devices.Application.Scan;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.Devices.Infrastructure.Scan;
using UniGate.Devices.Infrastructure.Stores;

namespace UniGate.Devices.Infrastructure.DependencyInjection;

public static class DevicesModuleServiceCollectionExtensions
{
    public static IServiceCollection AddDevicesModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException("Connection string 'MainDb' is not configured.");

        services.AddDbContext<DevicesDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "devices");
            });
        });

        services.AddScoped<IReaderDevicesStore, EfReaderDevicesStore>();

        services.AddScoped<CreateReaderDeviceUseCase>();
        services.AddScoped<ListReaderDevicesUseCase>();
        services.AddScoped<GetReaderDeviceUseCase>();
        services.AddScoped<UpdateReaderDeviceUseCase>();
        services.AddScoped<SetReaderDeviceActiveUseCase>();

        services.AddScoped<IReaderScanStore, EfReaderScanStore>();
        services.AddScoped<ICredentialResolver, DirectoryCredentialResolver>();
        services.AddScoped<IAccessDecisionGateway, AccessDecisionGateway>();

        services.AddScoped<ReaderScanUseCase>();

        return services;
    }
}