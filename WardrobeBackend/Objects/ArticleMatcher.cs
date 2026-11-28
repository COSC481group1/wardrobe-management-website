using WardrobeBackend.Entities;

public static class ArticleMatcher
{
    public static bool IsWarmLayer(Article article)
    {
        string text = $"{article.Name} {article.Description} {string.Join(" ", article.Tags)}";

        return text.Contains("hoodie")
            || text.Contains("sweater")
            || text.Contains("cardigan")
            || text.Contains("winter jacket")
            || text.Contains("jacket")
            || text.Contains("outerwear");
    }
}