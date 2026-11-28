using Npgsql;
using WardrobeBackend.Services;

namespace WardrobeBackend.Objects;

public class RefreshToken
{
    private static string Hash(string token) =>
        new RefreshTokenService().HashToken(token);

    public static async Task SaveAsync(string email, string token, DateTime expiresAt)
    {
        const string sql = @"
            INSERT INTO refresh_tokens (email, token_hash, expires_at)
            VALUES (@email, @token_hash, @expires_at);";

        await using var connection = await Database.ConnectionFactory.CreateConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("email", email);
        command.Parameters.AddWithValue("token_hash", Hash(token));
        command.Parameters.AddWithValue("expires_at", expiresAt);

        await command.ExecuteNonQueryAsync();
    }

    public static async Task<bool> IsValidAsync(string token)
    {
        const string sql = @"
            SELECT EXISTS (
                SELECT 1
                FROM refresh_tokens
                WHERE token_hash = @token_hash
                  AND expires_at > NOW()
                  AND revoked_at IS NULL
            );";

        await using var connection = await Database.ConnectionFactory.CreateConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("token_hash", Hash(token));

        return (bool)(await command.ExecuteScalarAsync())!;
    }

    public static async Task<string?> GetEmailAsync(string token)
    {
        const string sql = @"
            SELECT email
            FROM refresh_tokens
            WHERE token_hash = @token_hash
              AND expires_at > NOW()
              AND revoked_at IS NULL;";

        await using var connection = await Database.ConnectionFactory.CreateConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("token_hash", Hash(token));

        return await command.ExecuteScalarAsync() as string;
    }

    public static async Task RevokeAsync(string token)
    {
        const string sql = @"
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE token_hash = @token_hash
              AND revoked_at IS NULL;";

        await using var connection = await Database.ConnectionFactory.CreateConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("token_hash", Hash(token));

        await command.ExecuteNonQueryAsync();
    }
}