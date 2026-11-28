using WardrobeBackend.Repositories;
using WardrobeBackend.Entities;

namespace WardrobeBackend.Services;

public interface IArticleService
{
    Task<IReadOnlyList<Article>> GetAllAsync(string user, CancellationToken ct = default);

    Task<Article?> SaveAsync(string user, Article article, CancellationToken ct = default);

    Task<Article> CreateFromUploadAsync(string user, string s3Key, CancellationToken ct = default);

    Task<Article> SaveFromUploadAsync(string user, string s3Key, Article article, CancellationToken ct = default);
}

public sealed class ArticleService(
    IArticleRepository repository,
    IArticleAnalysisService analysis) : IArticleService
{
    public Task<IReadOnlyList<Article>> GetAllAsync(string user, CancellationToken ct = default) =>
        repository.GetAllForUserAsync(user, ct);

    public async Task<Article?> SaveAsync(string user, Article article, CancellationToken ct = default)
    {
        if (article.ArticleId == 0)
            return await repository.CreateAsync(user, article, ct);

        return await repository.UpdateAsync(user, article, ct) ? article : null;
    }

    public Task<Article> CreateFromUploadAsync(string user, string s3Key, CancellationToken ct = default) =>
        repository.CreateWithImageAsync(user, new Article(), Path.GetFileName(s3Key), ct);

    public async Task<Article> SaveFromUploadAsync(string user, string s3Key, Article article, CancellationToken ct = default)
    {
        await analysis.FillMissingFieldsAsync(article, s3Key, ct);
        return await repository.CreateWithImageAsync(user, article, Path.GetFileName(s3Key), ct);
    }
}