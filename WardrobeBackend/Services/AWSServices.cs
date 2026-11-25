using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using AwsS3.Models;
using Microsoft.Extensions.Options;
using System.Net;

namespace AwsS3.Services;

public class AWSServices : IAWSServices
{
    private readonly IAmazonS3 _s3;
    private readonly S3Options _options;
    private readonly ILogger<AWSServices> _logger;

    public AWSServices(IAmazonS3 s3, IOptions<S3Options> options, ILogger<AWSServices> logger)
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
    
    public Task<byte[]> DownloadFileAsync(string file, CancellationToken ct = default)
        => DownloadFileAsync(_options.BucketName, file, ct);

    public async Task<byte[]> DownloadFileAsync(string bucketName, string file, CancellationToken ct = default)
    {
        var request = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = file
        };

        try
        {
            using var response = await _s3.GetObjectAsync(request, ct);
            using var ms = new MemoryStream();
            await response.ResponseStream.CopyToAsync(ms, ct);

            if (ms.Length == 0)
                throw new FileNotFoundException($"The document '{file}' is empty.");

            return ms.ToArray();
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new FileNotFoundException($"The document '{file}' was not found.", ex);
        }
    }
}
    