using Npgsql;
using System.Collections.Generic;

namespace WardrobeBackend.Services
{
    public interface IDbConnectionFactory
    {
        Task<NpgsqlConnection> CreateConnectionAsync();
    }
}