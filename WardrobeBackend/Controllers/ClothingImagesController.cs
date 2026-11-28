using Amazon.S3;
using AwsS3.Models;
using AwsS3.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using WardrobeBackend.Objects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using WardrobeBackend.Services;
using WardrobeBackend.Models;

namespace AutoUpload.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ClothingImagesController : ControllerBase
{
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();
    private readonly IAWSServices _awsService;
    private readonly ILogger<ClothingImagesController> _logger;
    private readonly IArticleService _articles;
    private readonly string _originalBucket;
    private readonly string _processedBucket;
    private const string OriginalPrefix = "clothing/";
    private const string ProcessedPrefix = "processed/";
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public ClothingImagesController(IAWSServices awsService, ILogger<ClothingImagesController> logger, IArticleService articles, IOptions<S3Options> s3Options)
    {
        _awsService = awsService;
        _logger = logger;
        _articles = articles;
        _originalBucket = s3Options.Value.BucketName;
        _processedBucket = s3Options.Value.ProcessedBucketName;
    }
    private string CurrentUserEmail =>
    User.Claims.First(c => c.Type == "Email").Value;

private const int MaxBaseNameLength = 50;

    private static string BuildObjectKey(IFormFile file)
    {
        var ext = file.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png"  => ".png",
            "image/webp" => ".webp",
            _ => throw new InvalidOperationException($"Unsupported content type: {file.ContentType}")
        };

        var rawName = (file.FileName ?? string.Empty).Replace('\\', '/');
        var baseName = Path.GetFileNameWithoutExtension(rawName);

        // Keep ASCII letters, digits, '-' and '_' only
        var safeName = new string(baseName
            .Where(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_')
            .ToArray());

        if (safeName.Length > MaxBaseNameLength)
            safeName = safeName[..MaxBaseNameLength];

        if (safeName.Length == 0)
            safeName = "image";

        return $"clothing/{safeName}-{Guid.NewGuid():N}{ext}";
    }

    [HttpPost(Name = "UploadArticle")]
    public async Task<IActionResult> UploadFile([FromForm] UploadRequest request, CancellationToken ct)
    {
        var file = request.File;
        var articleDto = request.Article;

        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        if (file.Length > MaxFileSize)
            return BadRequest("File too large (max 10 MB).");

        if (!AllowedTypes.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG, or WebP images are allowed.");

        var docName = BuildObjectKey(file);

        await using var stream = file.OpenReadStream();

        var s3Obj = new S3UploadObject
        {
            InputStream = stream,
            Name = docName,
            ContentType = file.ContentType
        };

        var result = await _awsService.UploadFileAsync(s3Obj, ct);
        if (result.StatusCode >= 400)
            return StatusCode(result.StatusCode, result);

        var saved = await _articles.SaveFromUploadAsync(
            CurrentUserEmail, docName, articleDto.ToEntity(), ct);

        return Ok(saved.ToDto());
    }

    [HttpGet("{documentName}", Name = "GetDocument")]
    public async Task<IActionResult> GetDocumentFromS3(string documentName, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(documentName))
            return BadRequest("The 'documentName' parameter is required.");

        var fileName = Path.GetFileName(Uri.UnescapeDataString(documentName));

        if (!ContentTypeProvider.TryGetContentType(fileName, out var contentType))
            contentType = "application/octet-stream";

        try
        {
            _logger.LogInformation(
                "Looking for processed image in bucket '{Bucket}' at key '{Key}'",
                _processedBucket,
                ProcessedPrefix + fileName
            );
            var processedFileName = Path.GetFileNameWithoutExtension(fileName) + ".png";

            var processedKey = ProcessedPrefix + processedFileName;

            _logger.LogInformation(
                "Requesting processed PNG: s3://{Bucket}/{Key}",
                _processedBucket,
                processedKey
            );

            var processed = await TryDownloadAsync(
                _processedBucket,
                processedKey,
                ct
            );

            _logger.LogInformation(
                "Processed image lookup result: {Found}",
                processed is not null
            );

            if (processed is not null)
                return File(processed, contentType);

            var original = await TryDownloadAsync(_originalBucket, OriginalPrefix + fileName, ct);
            if (original is not null)
                return File(original, contentType);

            return NotFound($"The document '{fileName}' was not found.");
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "S3 error fetching {Key}", fileName);
            return StatusCode((int)ex.StatusCode, ex.Message);
        }
    }
    private async Task<byte[]?> TryDownloadAsync(string bucket, string key, CancellationToken ct)
    {
        try
        {
            return await _awsService.DownloadFileAsync(bucket, key, ct);
        }
        catch (FileNotFoundException)
        {
            return null;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;   // NoSuchKey
        }
    }
}