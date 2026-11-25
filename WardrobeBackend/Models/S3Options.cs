namespace AwsS3.Models;

public class S3Options
{
    public const string SectionName = "S3";
    public string BucketName { get; set; } = string.Empty;
    public string ProcessedBucketName { get; set; } = string.Empty;
}