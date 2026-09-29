using Npgsql;

namespace WardrobeBackend.Services
{
    public interface IDbConnectionFactory
    {
        Task<NpgsqlConnection> CreateConnectionAsync();
    }
}