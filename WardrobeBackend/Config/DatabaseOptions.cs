namespace WardrobeBackend.Config
{
    public class DatabaseOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 5432;
        public string Database { get; set; } = "";
        public string Username { get; set; } = "";
        public string Region { get; set; } = "";
    }
}