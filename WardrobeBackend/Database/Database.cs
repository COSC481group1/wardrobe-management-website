using Microsoft.AspNetCore.Connections;
using WardrobeBackend.Services;

namespace WardrobeBackend.Database
{
    public static class Database
    {
        public static IDbConnectionFactory ConnectionFactory { get; set; }
    }
}
