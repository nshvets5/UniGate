using UniGate.Api.Auth;
using UniGate.Api.Errors;
using UniGate.Api.Extensions;
using UniGate.Api.Middleware;
using UniGate.SharedKernel.Auth;
using UniGate.Iam.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IApiErrorMapper, ApiErrorMapper>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddIamModule();

builder.Services
    .AddAppAuthentication(builder.Configuration)
    .AddAppAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
