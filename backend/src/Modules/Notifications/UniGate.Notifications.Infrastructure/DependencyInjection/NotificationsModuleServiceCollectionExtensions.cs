using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Notifications.Application;
using UniGate.Notifications.Infrastructure.Dispatching;
using UniGate.Notifications.Infrastructure.Persistence;
using UniGate.Notifications.Infrastructure.Smtp;
using UniGate.Notifications.Infrastructure.Stores;

namespace UniGate.Notifications.Infrastructure.DependencyInjection;

public static class NotificationsModuleServiceCollectionExtensions
{
    public static IServiceCollection AddNotificationsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException("Connection string 'MainDb' is not configured.");

        services.AddDbContext<NotificationsDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "notifications");
            });
        });

        services.Configure<SmtpEmailOptions>(configuration.GetSection("Notifications:Email"));

        services.AddScoped<INotificationStore, EfNotificationStore>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        services.AddScoped<QueueEmailNotificationUseCase>();
        services.AddScoped<SendTestEmailUseCase>();

        services.AddHostedService<NotificationDispatcherHostedService>();

        return services;
    }
}