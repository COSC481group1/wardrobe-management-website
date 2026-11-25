using Microsoft.AspNetCore.Connections;
using Npgsql;
using System.Collections.Generic;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using System.Text.Json;

namespace WardrobeBackend.Objects;

public class Article
{
   public static Article FromDto(ArticleDto dto) => new()
    {
        category = dto.Category ?? Category.Misc,
        name = dto.Name ?? "",
        description = dto.Description ?? "",
        palette = dto.Palette ?? "",
        tags = [.. dto.Tags ?? []],
        articleId = dto.ArticleId,
        imageId = dto.ImageId,
        created = dto.ArticleId != 0
    };

    public ArticleDto ToDto() => new()
    {
        Category = category,
        Name = name,
        Description = description,
        Palette = palette,
        Tags = tags.ToArray(),
        ArticleId = articleId,
        ImageId = imageId
    };

    public Category category;
    public int articleId;
    public int imageId;
    public string name;
    public string description;
    public string palette;
    public List<string> tags;
    private bool created;

    private sealed record LambdaAnalysis(string? Category, string? Description, string? Palette, string? Tags, string? Name);  

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };
    public void CreateOrUpdate(string user)
    {
        if (created)
        {
            Update(user);
        }
        else
        {
            Create(user);
        }

    }
    private void Create(string user)
    {
        const string sql = @"
            INSERT INTO articles (username, category, description, palette, tags, name, image_id)
            VALUES (@username, @category, @description, @palette, @tags, @name, NULLIF(@image_id, 0));";

        Database.RunNonQueryWithParameters(sql,
            ("username", user),
            ("name", name),
            ("category", category.ToString()),
            ("description", description),
            ("palette", palette),
            ("tags", CrushTags()),
            ("image_id", imageId)).Wait();
        created = true;
    }
    private void Update(string user)
    {
        const string sql = @"
            UPDATE articles
            SET name = @name,
            description = @description,
            palette = @palette,
            category = @category,
            tags = @tags
            where username = @user and id = @article_id
            ";
        Database.RunNonQueryWithParameters(sql,
            ("name", name),
            ("article_id", articleId),
            ("description", description),
            ("palette", palette),
            ("category", category.ToString()),
            ("user", user),
            ("tags", CrushTags())).Wait();
    }
    private static Category? MapCategory(string? s) => s?.Trim().ToLowerInvariant() switch
    {
        "head"       => Category.Headwear,
        "undershirt" => Category.Undertop,
        "overshirt"  => Category.Overtop,
        "legs"       => Category.Bottom,
        "shoe"       => Category.Shoe,
        "misc"       => Category.Misc,
        _            => null
    };
    public IEnumerable<Article> FindAllInPlace(string user)
    {
        return Database.FindAll(r =>
        {
            category = Enum.TryParse(r.GetString(0), out Category result) ? result : Category.Misc;
            description = r.GetString(1);
            palette = r.GetString(2);
            tags = [..UnrollTags(r.GetString(3))];
            name = r.GetString(4);
            articleId = r.GetInt32(5);
            imageId = r.IsDBNull(6) ? 0 : r.GetInt32(6);
            return this;
        },
        @"SELECT category, description, palette, tags, name, id, image_id FROM articles WHERE username = @user",
        ("@user", user)).Result;
    }
    private string CrushTags()
    {
        if (tags == null || tags.Count == 0)
        {
            return "";
        }
        if (tags.Count == 1)
        {
            return tags[0];
        }
        return tags.Aggregate((t1, t2) => t1 + (char)8203 + t2);
    }
    public Article CreateFromUpload(string user, string s3Key)
    {
        const string sql = @"
            WITH img AS (
                INSERT INTO images (filename) VALUES (@key) RETURNING image_id
            )
            INSERT INTO articles (username, category, description, palette, tags, name, image_id)
            SELECT @username, '', '', '', '', '', image_id FROM img
            RETURNING id, image_id;";

        return Database.FindAll(r => new Article
        {
            articleId = r.GetInt32(0),
            imageId = r.GetInt32(1),
            category = Category.Misc,
            name = "",
            description = "",
            palette = "",
            tags = [],
            created = true
        }, sql, ("@key", s3Key), ("@username", user)).Result.Single();
    }
    public async Task SaveFromUploadAsync(string user, string s3Key, IAmazonLambda lambda)
    {
        bool needCategory = category == Category.Misc;
        bool needDescription = string.IsNullOrWhiteSpace(description);
        bool needPalette = string.IsNullOrWhiteSpace(palette);
        bool needTags = tags is null || tags.Count == 0;
        bool needName = string.IsNullOrWhiteSpace(name);

        if (needCategory || needDescription || needPalette || needTags || needName)
        {
            var response = await lambda.InvokeAsync(new InvokeRequest
            {
                FunctionName = "clothing-image-analysis",
                Payload = JsonSerializer.Serialize(new { s3Key })
            });

            if (response.FunctionError is null)
            {
                var result = await JsonSerializer.DeserializeAsync<LambdaAnalysis>(
                    response.Payload, JsonOpts);

                if (result is not null)
                {
                    if (needCategory && MapCategory(result.Category) is { } c)
                        category = c;
                    if (needDescription && result.Description is not null)
                        description = result.Description;
                    if (needPalette && result.Palette is not null)
                        palette = result.Palette;
                    if (needTags && !string.IsNullOrWhiteSpace(result.Tags))
                        tags = result.Tags.Split(',').Select(t => t.Trim()).ToList();
                    if (needName && !string.IsNullOrWhiteSpace(result.Name))
                        name = result.Name;
                }
            }
        }
    const string sql = @"
        WITH img AS (
            INSERT INTO images (filename) VALUES (@key) RETURNING image_id
        )
        INSERT INTO articles (username, category, description, palette, tags, name, image_id)
        SELECT @username, @category, @description, @palette, @tags, @name, image_id FROM img
        RETURNING id, image_id;";

    var fileName = Path.GetFileName(s3Key);

    var (id, newImageId) = (await Database.FindAll(
        r => (r.GetInt32(0), r.GetInt32(1)),
        sql,
        ("@key", fileName),
        ("@username", user),
        ("@category", category.ToString()),
        ("@description", description ?? ""),
        ("@palette", palette ?? ""),
        ("@tags", CrushTags()),
        ("@name", name ?? ""))).Single();

    articleId = id;
    imageId = newImageId;
    created = true;
}
    private static string[] UnrollTags(string tags) =>
        tags == "" 
        ? []
        : tags.Split((char)8203);
}

public enum Category
{
    Headwear,
    Undertop,
    Overtop,
    Bottom,
    Shoe,
    Misc
}

 
