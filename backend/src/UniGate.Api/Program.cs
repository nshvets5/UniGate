using UniGate.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services
    .AddAppAuthentication(builder.Configuration)
    .AddAppAuthorization();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<UniGate.SharedKernel.Auth.ICurrentUser, UniGate.Api.Auth.HttpCurrentUser>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
