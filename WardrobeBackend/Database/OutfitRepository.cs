using System.Data;
using Npgsql;
using WardrobeBackend.Entities;
using WardrobeBackend.Services;

namespace WardrobeBackend.Repositories;

public interface IOutfitRepository
{
    Task<IReadOnlyList<Outfit>> GetAllForUserAsync(string username, CancellationToken ct = default);

    Task<Outfit> CreateAsync(string username, Outfit outfit, CancellationToken ct = default);

    Task<bool> UpdateAsync(string username, Outfit outfit, CancellationToken ct = default);
}

public sealed class OutfitRepository(IDbConnectionFactory connectionFactory) : IOutfitRepository
{
    private const char IdSeparator = '\u200B'; 

    private const string SelectAllSql = @"
        SELECT outfit_id, name, description, head_id, overshirt_id, undershirt_id, legs_id, shoe_id, misc_ids
        FROM outfits
        WHERE username = @username";

    private const string InsertSql = @"
        INSERT INTO outfits (username, name, description, head_id, overshirt_id, undershirt_id, legs_id, shoe_id, misc_ids)
        VALUES (@username, @name, @description, @headId, @overShirtId, @underShirtId, @legsId, @shoeId, @miscIds)
        RETURNING outfit_id;";

    private const string UpdateSql = @"
        UPDATE outfits
        SET name = @name,
            description = @description,
            head_id = @headId,
            overshirt_id = @overShirtId,
            undershirt_id = @underShirtId,
            legs_id = @legsId,
            shoe_id = @shoeId,
            misc_ids = @miscIds
        WHERE username = @username AND outfit_id = @outfitId";

    public async Task<IReadOnlyList<Outfit>> GetAllForUserAsync(string username, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(SelectAllSql, conn);
        cmd.Parameters.AddWithValue("username", username);

        var results = new List<Outfit>();
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            results.Add(new Outfit
            {
                OutfitId = reader.GetInt32(0),
                Name = reader.GetString(1),
                Description = reader.GetString(2),
                HeadId = reader.GetInt32(3),
                OverShirtId = reader.GetInt32(4),
                UnderShirtId = reader.GetInt32(5),
                LegsId = reader.GetInt32(6),
                ShoeId = reader.GetInt32(7),
                MiscIds = UnrollIds(reader.GetString(8)),
            });
        }
        return results;
    }

    public async Task<Outfit> CreateAsync(string username, Outfit outfit, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(InsertSql, conn);
        AddOutfitParameters(cmd, username, outfit);

        var id = await cmd.ExecuteScalarAsync(ct)
                 ?? throw new InvalidOperationException("Insert did not return an outfit id.");
        outfit.OutfitId = Convert.ToInt32(id);
        return outfit;
    }

    public async Task<bool> UpdateAsync(string username, Outfit outfit, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(UpdateSql, conn);
        AddOutfitParameters(cmd, username, outfit);
        cmd.Parameters.AddWithValue("outfitId", outfit.OutfitId);

        return await cmd.ExecuteNonQueryAsync(ct) > 0;
    }

    private async Task<NpgsqlConnection> OpenConnectionAsync(CancellationToken ct)
    {
        var conn = await connectionFactory.CreateConnectionAsync();
        try
        {
            if (conn.State != ConnectionState.Open)
                await conn.OpenAsync(ct);
            return conn;
        }
        catch
        {
            await conn.DisposeAsync();
            throw;
        }
    }

    private static void AddOutfitParameters(NpgsqlCommand cmd, string username, Outfit outfit)
    {
        cmd.Parameters.AddWithValue("username", username);
        cmd.Parameters.AddWithValue("name", outfit.Name ?? "");
        cmd.Parameters.AddWithValue("description", outfit.Description ?? "");
        cmd.Parameters.AddWithValue("headId", outfit.HeadId);
        cmd.Parameters.AddWithValue("overShirtId", outfit.OverShirtId);
        cmd.Parameters.AddWithValue("underShirtId", outfit.UnderShirtId);
        cmd.Parameters.AddWithValue("legsId", outfit.LegsId);
        cmd.Parameters.AddWithValue("shoeId", outfit.ShoeId);
        cmd.Parameters.AddWithValue("miscIds", CrushIds(outfit.MiscIds));
    }

    private static string CrushIds(List<int>? ids) =>
        ids is null or { Count: 0 } ? "" : string.Join(IdSeparator, ids);

    private static List<int> UnrollIds(string ids) =>
        ids == "" ? [] : [.. ids.Split(IdSeparator).Select(int.Parse)];
}