
using WardrobeBackend.Objects;

public class ArticleDto
{
    public Category Category { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public string Palette { get; set; }

    public string[] Tags { get; set; }
}

