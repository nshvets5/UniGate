using Microsoft.Extensions.DependencyInjection;
using UniGate.Iam.Application.UseCases.GetCurrentUser;

namespace UniGate.Iam.Infrastructure.DependencyInjection;

public static class IamModuleServiceCollectionExtensions
{
    public static IServiceCollection AddIamModule(this IServiceCollection services)
    {
        services.AddScoped<GetCurrentUserUseCase>();
        return services;
    }
}
