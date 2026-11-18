using Microsoft.AspNetCore.Connections;
using Npgsql;
using System.Collections.Generic;

namespace WardrobeBackend.Objects;

public class Article
{
    public static Article FromDto(ArticleDto dto) => new()
    {
        category = dto.Category,
        name = dto.Name,
        description = dto.Description,
        palette = dto.Palette,
        tags = [.. dto.Tags],
        articleId = dto.ArticleId,
        created = dto.ArticleId != 0
    };

    public ArticleDto ToDto() => new()
    {
        Category = category,
        Name = name,
        Description = description,
        Palette = palette,
        Tags = tags.ToArray(),
        ArticleId = articleId
    };

    public Category category;
    public int articleId;
    public string name;
    public string description;
    public string palette;
    public List<string> tags;
    private bool created;


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
                INSERT INTO articles (username, category, description, palette, tags, name)
                VALUES (@username, @category, @description, @palette, @tags, @name);";

        using var connection = Database.ConnectionFactory.CreateConnectionAsync().Result;
        
        Database.RunNonQueryWithParameters(sql,
            ("username", user),
            ("name", name),
            ("category", category.ToString()),
            ("description", description),
            ("palette", palette),
            ("tags", CrushTags())).Wait();
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
            return this;
        },
        @"SELECT category, description, palette, tags, name, id FROM articles WHERE username = @user",
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
