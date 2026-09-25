using Microsoft.AspNetCore.Builder;
using NSwag.AspNetCore;
using YamlDotNet.Serialization;
using WardrobeBackend.Config;
using WardrobeBackend.Services;

namespace WardrobeBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Bind Database section from appsettings.json into DatabaseOptions
            builder.Services.Configure<DatabaseOptions>(
                builder.Configuration.GetSection("Database"));

            // Register the connection factory
            builder.Services.AddScoped<IDbConnectionFactory, RdsIamConnectionFactory>();

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerDocument();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseSwaggerUi(settings =>
            {
                settings.SwaggerRoutes.Add(new SwaggerUiRoute("v1", "/openapi/v1.json"));
            });

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}