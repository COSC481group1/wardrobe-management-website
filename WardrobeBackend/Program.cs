
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.AspNetCore;
using NSwag.Generation.Processors.Security;
using System.Text;
using WardrobeBackend.Controllers;
using YamlDotNet.Serialization;
using WardrobeBackend.Config;
using WardrobeBackend.Services;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;
using Npgsql;

namespace WardrobeBackend
{
    public class Program
    {
        public const string Me = @"https://localhost:7163/";

        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection("Database"));
            builder.Services.AddScoped<IDbConnectionFactory, RdsIamConnectionFactory>();

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

            builder.Services.AddSwaggerDocument(document =>
            {
                document.AddSecurity("JWT", Enumerable.Empty<string>(),
                    new OpenApiSecurityScheme
                    {
                        Type = OpenApiSecuritySchemeType.ApiKey,
                        Name = "Authorization",
                        Scheme = "Bearer",
                        BearerFormat = "JWT",
                        In = OpenApiSecurityApiKeyLocation.Header,
                        Description = "Type into the textbox: Bearer {your JWT token}."
                    });
                document.OperationProcessors.Add(
                    new AspNetCoreOperationSecurityScopeProcessor("JWT"));
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).
                AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidAlgorithms = new[]
                        {
                            SecurityAlgorithms.HmacSha256,
                        },
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidIssuer = Me,
                        ValidAudience = Me,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TokenProvider.SecureKey)),                        
                   };
                });

            builder.Services.AddSingleton<ITokenProvider, TokenProvider>();

            var app = builder.Build();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseOpenApi();
            
            using var scope = app.Services.CreateScope();
            Database.ConnectionFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();

            app.UseSwaggerUi(settings =>
            {
                settings.SwaggerRoutes.Add(new SwaggerUiRoute("v1", "/swagger/v1/swagger.json"));
            });

            app.UseHttpsRedirection();
            app.MapControllers();

            app.Run();
        }
    } 
}