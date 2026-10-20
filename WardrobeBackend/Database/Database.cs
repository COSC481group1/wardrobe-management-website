using Microsoft.AspNetCore.Connections;
using Npgsql;
using System.Collections;
using WardrobeBackend.Services;


public static class Database
{
    public static IDbConnectionFactory ConnectionFactory { get; set; }

    public static async Task RunNonQueryWithParameters(string sql, params (string, object)[] paramters)
    {
        await using var connection = await ConnectionFactory.CreateConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        foreach ((string name, object value) in paramters)
        {
            command.Parameters.AddWithValue(name, value);
        }
        await command.ExecuteNonQueryAsync();
    }

    public static async Task<ReadResult<T>> FindAll<T>(Func<NpgsqlDataReader, T> transform, string sql, params (string, object)[] paramters)
    {
        var connection = await ConnectionFactory.CreateConnectionAsync();
        var command = new NpgsqlCommand(sql, connection);
        foreach ((string name, object value) in paramters)
        {
            command.Parameters.AddWithValue(name, value);
        }
        var reader = await command.ExecuteReaderAsync();
        return new ReadResult<T>(reader, transform);
    }

    public class ReadResult<T> : IEnumerable<T>, IDisposable
    {
        private readonly NpgsqlDataReader reader;
        private readonly Func<NpgsqlDataReader, T> transform;

        public ReadResult(NpgsqlDataReader reader, Func<NpgsqlDataReader, T> transform)
        {
            this.reader = reader;
            this.transform = transform;
        }

        public void Dispose() =>
            reader.DisposeAsync();

        private IEnumerator<T> ReadOver()
        {
            while (reader.Read())
            {
                yield return transform(reader);
            }
        }

        public IEnumerator<T> GetEnumerator() =>
            ReadOver();

        IEnumerator IEnumerable.GetEnumerator() =>
            ReadOver();
    }
}

