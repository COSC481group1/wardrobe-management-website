using Amazon.S3;
using Amazon.S3.Transfer;
using AwsS3.Models;
using Microsoft.Extensions.Options;

namespace AwsS3.Services;

public class StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly S3Options _options;
    private readonly ILogger<StorageService> _logger;

    public StorageService(IAmazonS3 s3, IOptions<S3Options> options, ILogger<StorageService> logger)
    {
        _s3 = s3;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<S3ResponseDto> UploadFileAsync(S3UploadObject obj, CancellationToken ct = default)
    {
        var response = new S3ResponseDto();

        try
        {
            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = obj.InputStream,
                Key = obj.Name,
                BucketName = _options.BucketName,
                ContentType = obj.ContentType,   // <- new line
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            var transferUtility = new TransferUtility(_s3);
            await transferUtility.UploadAsync(uploadRequest, ct);

            response.StatusCode = 201;
            response.Message = $"{obj.Name} has been uploaded successfully";
        }
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "S3 upload failed for {Key}", obj.Name);
            response.StatusCode = (int)s3Ex.StatusCode;
            response.Message = s3Ex.Message;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error uploading {Key}", obj.Name);
            response.StatusCode = 500;
            response.Message = ex.Message;
        }

        return response;
    }
}