using Microsoft.AspNetCore.Builder;
using NSwag.AspNetCore;
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
        public static async Task Main(string[] args)
{
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection("Database"));
            builder.Services.AddScoped<IDbConnectionFactory, RdsIamConnectionFactory>();

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

        public static async Task Password(IDbConnectionFactory dbFactory) {
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
            await SaveUserAsync("jmiles11", hashed, saltString, dbFactory);
        }

        public static async Task SaveUserAsync(string username, string hash, string salt, IDbConnectionFactory dbFactory) {
            const string sql = @"
                INSERT INTO users (username, password_hash, password_salt)
                VALUES (@username, @password_hash, @password_salt);";

            await using var connection = await dbFactory.CreateConnectionAsync();

            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("username", username);
            command.Parameters.AddWithValue("password_hash", hash);
            command.Parameters.AddWithValue("password_salt", salt);

            await command.ExecuteNonQueryAsync();
        }
    } 
}