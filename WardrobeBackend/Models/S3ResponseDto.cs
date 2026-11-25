namespace AwsS3.Models;

public class S3ResponseDto
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
}