using Microsoft.AspNetCore.Http;

public class UploadRequest
{
    public IFormFile File { get; set; } = null!;
    public ArticleDto Article { get; set; } = new();
}