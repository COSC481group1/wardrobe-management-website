
using Microsoft.AspNetCore.Builder;
using NSwag.AspNetCore;
using YamlDotNet.Serialization;

namespace WardrobeBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddSwaggerDocument();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
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
