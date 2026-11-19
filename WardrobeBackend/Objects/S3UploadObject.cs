public class S3UploadObject
{
    public string Name { get; set; } = null!;
    public Stream InputStream { get; set; } = null!;
    public string ContentType { get; set; } = "application/octet-stream";
}