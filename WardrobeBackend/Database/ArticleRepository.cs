using System.Data;
using Npgsql;
using WardrobeBackend.Entities;
using WardrobeBackend.Services;

namespace WardrobeBackend.Repositories;

public interface IArticleRepository
{
    Task<IReadOnlyList<Article>> GetAllForUserAsync(string username, CancellationToken ct = default);

    Task<Article> CreateAsync(string username, Article article, CancellationToken ct = default);

    Task<Article> CreateWithImageAsync(string username, Article article, string imageFilename, CancellationToken ct = default);

    Task<bool> UpdateAsync(string username, Article article, CancellationToken ct = default);
}

public sealed class ArticleRepository(IDbConnectionFactory connectionFactory) : IArticleRepository
{
    private const char TagSeparator = '\u200B';

    private const string SelectAllSql = @"
        SELECT a.category, a.description, a.palette, a.tags, a.name, a.id, a.image_id, i.filename
        FROM articles a
        LEFT JOIN images i ON a.image_id = i.image_id
        WHERE a.username = @username";

    private const string InsertSql = @"
        INSERT INTO articles (username, category, description, palette, tags, name, image_id)
        VALUES (@username, @category, @description, @palette, @tags, @name, NULLIF(@image_id, 0))
        RETURNING id, image_id;";

    private const string InsertWithImageSql = @"
        WITH img AS (
            INSERT INTO images (filename) VALUES (@filename) RETURNING image_id
        )
        INSERT INTO articles (username, category, description, palette, tags, name, image_id)
        SELECT @username, @category, @description, @palette, @tags, @name, image_id FROM img
        RETURNING id, image_id;";

    private const string UpdateSql = @"
        UPDATE articles
        SET name = @name,
            description = @description,
            palette = @palette,
            category = @category,
            tags = @tags
        WHERE username = @username AND id = @id";

    public async Task<IReadOnlyList<Article>> GetAllForUserAsync(string username, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(SelectAllSql, conn);
        cmd.Parameters.AddWithValue("username", username);

        var results = new List<Article>();
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            results.Add(new Article
            {
                Category = Enum.TryParse<Category>(reader.GetString(0), out var category) ? category : Category.Misc,
                Description = reader.GetString(1),
                Palette = reader.GetString(2),
                Tags = UnrollTags(reader.GetString(3)),
                Name = reader.GetString(4),
                ArticleId = reader.GetInt32(5),
                ImageId = reader.IsDBNull(6) ? 0 : reader.GetInt32(6),
                Filename = reader.IsDBNull(7) ? null : reader.GetString(7),
            });
        }
        return results;
    }

    public async Task<Article> CreateAsync(string username, Article article, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(InsertSql, conn);
        AddArticleParameters(cmd, username, article);
        cmd.Parameters.AddWithValue("image_id", article.ImageId);

        return await ReadInsertedIdsAsync(cmd, article, ct);
    }

    public async Task<Article> CreateWithImageAsync(string username, Article article, string imageFilename, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(InsertWithImageSql, conn);
        AddArticleParameters(cmd, username, article);
        cmd.Parameters.AddWithValue("filename", imageFilename);

        return await ReadInsertedIdsAsync(cmd, article, ct);
    }

    public async Task<bool> UpdateAsync(string username, Article article, CancellationToken ct = default)
    {
        await using var conn = await OpenConnectionAsync(ct);
        await using var cmd = new NpgsqlCommand(UpdateSql, conn);
        AddArticleParameters(cmd, username, article);
        cmd.Parameters.AddWithValue("id", article.ArticleId);

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

    private static void AddArticleParameters(NpgsqlCommand cmd, string username, Article article)
    {
        cmd.Parameters.AddWithValue("username", username);
        cmd.Parameters.AddWithValue("name", article.Name ?? "");
        cmd.Parameters.AddWithValue("description", article.Description ?? "");
        cmd.Parameters.AddWithValue("palette", article.Palette ?? "");
        cmd.Parameters.AddWithValue("category", article.Category.ToString());
        cmd.Parameters.AddWithValue("tags", CrushTags(article.Tags));
    }

    private static async Task<Article> ReadInsertedIdsAsync(NpgsqlCommand cmd, Article article, CancellationToken ct)
    {
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
            throw new InvalidOperationException("Insert did not return a row.");

        article.ArticleId = reader.GetInt32(0);
        article.ImageId = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
        return article;
    }

    private static string CrushTags(List<string>? tags) =>
        tags is null or { Count: 0 } ? "" : string.Join(TagSeparator, tags);

    private static List<string> UnrollTags(string tags) =>
        tags == "" ? [] : [.. tags.Split(TagSeparator)];
}