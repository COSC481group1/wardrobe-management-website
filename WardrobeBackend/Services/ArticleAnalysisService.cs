using System.Text.Json;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using WardrobeBackend.Entities;

namespace WardrobeBackend.Services;

public interface IArticleAnalysisService
{
    Task FillMissingFieldsAsync(Article article, string s3Key, CancellationToken ct = default);
}

public sealed class ArticleAnalysisService(
    IAmazonLambda lambda,
    ILogger<ArticleAnalysisService> logger) : IArticleAnalysisService
{
    private const string FunctionName = "clothing-image-analysis";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private sealed record LambdaAnalysis(string? Category, string? Description, string? Palette, string? Tags, string? Name);

    public async Task FillMissingFieldsAsync(Article article, string s3Key, CancellationToken ct = default)
    {
        bool needCategory = article.Category == Category.Misc;
        bool needDescription = string.IsNullOrWhiteSpace(article.Description);
        bool needPalette = string.IsNullOrWhiteSpace(article.Palette);
        bool needTags = article.Tags is null || article.Tags.Count == 0;
        bool needName = string.IsNullOrWhiteSpace(article.Name);

        if (!(needCategory || needDescription || needPalette || needTags || needName))
            return;

        var response = await lambda.InvokeAsync(new InvokeRequest
        {
            FunctionName = FunctionName,
            Payload = JsonSerializer.Serialize(new { s3Key })
        }, ct);

        if (response.FunctionError is not null)
        {
            logger.LogWarning("Image analysis failed for {S3Key}: {Error}", s3Key, response.FunctionError);
            return;
        }

        var result = await JsonSerializer.DeserializeAsync<LambdaAnalysis>(response.Payload, JsonOpts, ct);
        if (result is null)
            return;

        if (needCategory && MapCategory(result.Category) is { } category)
            article.Category = category;
        if (needDescription && result.Description is not null)
            article.Description = result.Description;
        if (needPalette && result.Palette is not null)
            article.Palette = result.Palette;
        if (needTags && !string.IsNullOrWhiteSpace(result.Tags))
            article.Tags = result.Tags.Split(',').Select(t => t.Trim()).ToList();
        if (needName && !string.IsNullOrWhiteSpace(result.Name))
            article.Name = result.Name;
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
}