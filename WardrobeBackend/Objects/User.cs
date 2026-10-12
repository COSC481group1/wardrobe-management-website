using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Npgsql;
using System.Security.Cryptography;
using WardrobeBackend.Services;

namespace WardrobeBackend.Objects;

public class User
{
    #region Static

    public static async Task SaveUserAsync(string email, string password)
    {
        const string sql = @"
                INSERT INTO users (email, password_hash, password_salt)
                VALUES (@email, @password_hash, @password_salt);";

        byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);
        string hashed = Saltify(password, salt);

        await using var connection = await Database.ConnectionFactory.CreateConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("email", email);
        command.Parameters.AddWithValue("password_hash", hashed);
        command.Parameters.AddWithValue("password_salt", Convert.ToBase64String(salt));

        await command.ExecuteNonQueryAsync();
    }

    private static string Saltify(string password, byte[] salt) =>
        Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 600000,
            numBytesRequested: 256 / 8));

    #endregion

    private string? email;
    private string? passHash;
    private string? passSalt;


    public bool GetUser(string email)
    {
        this.email = email;
        return GetByEmail(email);
    }

    public bool CheckPassword(string password)
    {
        if (passHash != null && passSalt != null)
        {
            return passHash.Equals(Saltify(password, Convert.FromBase64String(passSalt)));
        }
        return false;
    }

    private bool GetByEmail(string email)
    {
        const string sql = @"SELECT * FROM users WHERE email = @email;";

        using var connection = Database.ConnectionFactory.CreateConnectionAsync().Result;
        using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("email", email);
        using var result = command.ExecuteReader();
        if (result.Read())
        {
            passHash = result.GetString(2);
            passSalt = result.GetString(3);
            return true;
        }
        else
        {
            return false;
        }
    }
}

