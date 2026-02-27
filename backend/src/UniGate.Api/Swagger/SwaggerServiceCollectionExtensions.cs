using System.Reflection;
using Microsoft.OpenApi;

namespace UniGate.Api.Swagger;

public static class SwaggerServiceCollectionExtensions
{
    private const string DocName = "v1";
    private const string ApiTitle = "UniGate API";
    private const string JwtSchemeName = "Bearer";

    public static IServiceCollection AddAppSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(DocName, new OpenApiInfo
            {
                Title = ApiTitle,
                Version = DocName,
                Description = "UniGate HTTP API"
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            options.AddSecurityDefinition(JwtSchemeName, new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Name = "Authorization",
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(JwtSchemeName, document)] = new List<string>()
            });
        });

        return services;
    }

    public static IApplicationBuilder UseAppSwagger(this IApplicationBuilder app, bool enable = true)
    {
        if (!enable)
            return app;

        app.UseSwagger(c =>
        {
            c.RouteTemplate = "swagger/{documentName}/swagger.json";
        });

        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint($"/swagger/{DocName}/swagger.json", $"{ApiTitle} ({DocName})");
            c.RoutePrefix = "swagger";

            c.DisplayRequestDuration();
            c.EnablePersistAuthorization();
            c.DefaultModelsExpandDepth(-1);
        });

        return app;
    }
}