using WardrobeBackend.Entities;

namespace WardrobeBackend.Models;

public static class ArticleMapper
{
    public static Article ToEntity(this ArticleDto dto) => new()
    {
        ArticleId = dto.ArticleId,
        ImageId = dto.ImageId,
        Category = dto.Category ?? Category.Misc,
        Name = dto.Name ?? "",
        Description = dto.Description ?? "",
        Palette = dto.Palette ?? "",
        Tags = [.. dto.Tags ?? []],
    };

    public static ArticleDto ToDto(this Article article) => new()
    {
        ArticleId = article.ArticleId,
        ImageId = article.ImageId,
        Filename = article.Filename,
        Category = article.Category,
        Name = article.Name,
        Description = article.Description,
        Palette = article.Palette,
        Tags = article.Tags.ToArray(),
    };
}