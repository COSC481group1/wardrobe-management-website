using AwsS3.Models;

namespace AwsS3.Services;

public interface IAWSServices
{
    Task<byte[]> DownloadFileAsync(string file, CancellationToken ct = default);
    Task<byte[]> DownloadFileAsync(string bucketName, string file, CancellationToken ct = default);
    Task<S3ResponseDto> UploadFileAsync(S3UploadObject obj, CancellationToken ct = default);
    
}