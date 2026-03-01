using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniGate.Directory.Application.Groups;
using UniGate.Directory.Application.Groups.UseCases;
using UniGate.Directory.Application.Students;
using UniGate.Directory.Application.Students.UseCases;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.Directory.Infrastructure.Stores;

namespace UniGate.Directory.Infrastructure.DependencyInjection;

public static class DirectoryModuleServiceCollectionExtensions
{
    public static IServiceCollection AddDirectoryModule(this IServiceCollection services, IConfiguration configuration)
    {
        var cs = configuration.GetConnectionString("MainDb");
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException(
                "Connection string 'MainDb' is not configured. " +
                "Set it via .NET User Secrets or env var ConnectionStrings__MainDb.");

        services.AddDbContext<DirectoryDbContext>(opt =>
        {
            opt.UseNpgsql(cs, npgsql =>
            {
                npgsql.EnableRetryOnFailure(5);
                npgsql.MigrationsHistoryTable("__efmigrations_history", "directory");
            });
        });

        services.AddScoped<IGroupStore, EfGroupStore>();

        services.AddScoped<CreateGroupUseCase>();
        services.AddScoped<ListGroupsUseCase>();
        services.AddScoped<GetGroupByIdUseCase>();
        services.AddScoped<UpdateGroupUseCase>();
        services.AddScoped<SetGroupActiveUseCase>();

        services.AddScoped<IStudentStore, EfStudentStore>();

        services.AddScoped<CreateStudentUseCase>();
        services.AddScoped<ListStudentsUseCase>();
        services.AddScoped<GetStudentByIdUseCase>();
        services.AddScoped<UpdateStudentUseCase>();
        services.AddScoped<SetStudentActiveUseCase>();
        services.AddScoped<ChangeStudentGroupUseCase>();
        services.AddScoped<BindStudentProfileUseCase>();

        return services;
    }
}