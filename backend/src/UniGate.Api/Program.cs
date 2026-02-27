using UniGate.Api.Auth;
using UniGate.Api.Endpoints;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Api.HealthChecks;
using UniGate.Api.Middleware;
using UniGate.Iam.Infrastructure.DependencyInjection;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient("health", client =>
{
    client.Timeout = TimeSpan.FromSeconds(3);
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<IamDbContext>(
        name: "db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddCheck<KeycloakDiscoveryHealthCheck>(
        name: "keycloak",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" });

builder.Services.AddSingleton<IApiErrorMapper, ApiErrorMapper>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();

builder.Services.AddSingleton<IIdentityProvider, ConfigIdentityProvider>();

builder.Services.AddIamModule(builder.Configuration);

builder.Services
    .AddAppAuthentication(builder.Configuration)
    .AddAppAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthEndpoints();

app.Run();
