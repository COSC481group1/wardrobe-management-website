namespace WardrobeBackend.Entities;

public class Article
{
    public int ArticleId { get; set; }
    public int ImageId { get; set; }
    public string? Filename { get; set; }
    public Category Category { get; set; } = Category.Misc;
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Palette { get; set; } = "";
    public List<string> Tags { get; set; } = [];
}