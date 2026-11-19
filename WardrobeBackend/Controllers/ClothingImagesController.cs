using AwsS3.Models;
using AwsS3.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoUpload.Controllers;

[ApiController]
[Route("[controller]")]
public class ClothingImagesController : ControllerBase
{
    // 1. Constants and static fields go at the top of the class
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    // 2. Injected services
    private readonly IStorageService _storageService;

    // 3. Constructor
    public ClothingImagesController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    // 4. The upload endpoint
    [HttpPost(Name = "UploadFile")]
    public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        if (file.Length > MaxFileSize)
            return BadRequest("File too large (max 10 MB).");

        if (!AllowedTypes.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG, or WebP images are allowed.");

        var fileExt = Path.GetExtension(file.FileName);
        var docName = $"clothing/{Guid.NewGuid()}{fileExt}";

        await using var stream = file.OpenReadStream();

        var s3Obj = new S3UploadObject
        {
            InputStream = stream,
            Name = docName,
            ContentType = file.ContentType
        };

        var result = await _storageService.UploadFileAsync(s3Obj, ct);

        return StatusCode(result.StatusCode, result);
    }
}