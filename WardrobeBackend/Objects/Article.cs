using Npgsql;

namespace WardrobeBackend.Objects;

public class Article
{
    public static Dictionary<string, List<Article>> dummyCache = new();

    public static Article FromDto(ArticleDto dto) => new()
    {
        category = dto.Category,
        name = dto.Name,
        description = dto.Description,
        palette = dto.Palette,
        tags = [.. dto.Tags],
    };

    public ArticleDto ToDto() => new()
    {
        Category = category,
        Name = name,
        Description = description,
        Palette = palette,
        Tags = tags.ToArray()
    };

    public Category category;
    public string name;
    public string description;
    public string palette;
    public List<string> tags;
    private bool created;

    private string CrushTags()
    {
        if (tags == null)
        {
            return "";
        }
        if (tags.Count == 1)
        {
            return tags[0];
        }
        return tags.Aggregate((t1, t2) => t1 + (char)8203 + t2);
    }
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
