
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

            builder.Services.AddControllers();

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
            
            // One-off: run only when launched with a "create-user" argument
            if (args.Contains("create-user")) {
                using var scope = app.Services.CreateScope();
                var dbFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();

                await Password(dbFactory);
                return; // exit instead of starting the web server
            }

            app.UseSwaggerUi(settings =>
            {
                settings.SwaggerRoutes.Add(new SwaggerUiRoute("v1", "/swagger/v1/swagger.json"));
            });

            app.UseHttpsRedirection();
            app.MapControllers();

            app.Run();
        }

        public static async Task Password(IDbConnectionFactory dbFactory) {
            Console.Write("Enter a email: ");
            string? email = Console.ReadLine();

            Console.Write("Enter a password: ");
            string? password = Console.ReadLine();

            byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);
            string saltString = Convert.ToBase64String(salt);
            Console.WriteLine($"Salt: {saltString}");

            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password!,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 600000,
                numBytesRequested: 256 / 8));

            Console.WriteLine($"Hashed: {hashed}");
            await SaveUserAsync(email!, hashed, saltString, dbFactory);
        }

        public static async Task SaveUserAsync(string email, string hash, string salt, IDbConnectionFactory dbFactory) {
            const string sql = @"
                INSERT INTO users (email, password_hash, password_salt)
                VALUES (@email, @password_hash, @password_salt);";

            await using var connection = await dbFactory.CreateConnectionAsync();

            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("email", email);
            command.Parameters.AddWithValue("password_hash", hash);
            command.Parameters.AddWithValue("password_salt", salt);

            await command.ExecuteNonQueryAsync();
        }
    } 
}