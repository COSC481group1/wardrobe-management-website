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
