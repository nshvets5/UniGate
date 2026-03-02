using UniGate.Access.Infrastructure.DependencyInjection;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.Api.Auth;
using UniGate.Api.Endpoints;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Api.HealthChecks;
using UniGate.Api.Middleware;
using UniGate.Api.Observability;
using UniGate.Api.Security;
using UniGate.Api.Swagger;
using UniGate.Audit.Infrastructure.DependencyInjection;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.Directory.Infrastructure.DependencyInjection;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.Iam.Infrastructure.DependencyInjection;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.Timetable.Infrastructure.DependencyInjection;
using UniGate.Timetable.Infrastructure.Persistence;
using UniGate.Timetable.Infrastructure.Sync;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAppSwagger();

builder.Services.AddHttpClient("health", client =>
{
    client.Timeout = TimeSpan.FromSeconds(3);
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<IamDbContext>(
        name: "db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddDbContextCheck<AuditDbContext>
        (name: "audit_db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddDbContextCheck<DirectoryDbContext>
        (name: "directory_db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddDbContextCheck<AccessDbContext>
        (name: "access_db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddDbContextCheck<TimetableDbContext>
        (name: "timetable_db",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddCheck<KeycloakDiscoveryHealthCheck>(
        name: "keycloak",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" })
    .AddCheck<OutboxBacklogHealthCheck>(
        name: "outbox_backlog",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
        tags: new[] { "ready" })
    .AddCheck<TimetableSyncHealthCheck>(
        name: "timetable_sync",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "ready" });

builder.Services.AddSingleton<IApiErrorMapper, ApiErrorMapper>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddScoped<UniGate.SharedKernel.Observability.IRequestContext, UniGate.Api.Observability.HttpRequestContext>();

builder.Services.AddSingleton<IIdentityProvider, ConfigIdentityProvider>();

builder.Services.AddIamModule(builder.Configuration);
builder.Services.AddAuditModule(builder.Configuration);
builder.Services.AddDirectoryModule(builder.Configuration);
builder.Services.AddAccessModule(builder.Configuration);
builder.Services.AddTimetableModule(builder.Configuration);

builder.Services.AddScoped<ICurrentProfileIdAccessor, CurrentProfileIdAccessor>();

builder.Services.AddHostedService<UniGate.Api.Outbox.OutboxProcessorHostedService>();

builder.Services
    .AddAppAuthentication(builder.Configuration)
    .AddAppAuthorization()
    .AddAuditAuthorization()
    .AddDirectoryAuthorization()
    .AddAccessAuthorization();

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestLoggingScopeMiddleware>();

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
