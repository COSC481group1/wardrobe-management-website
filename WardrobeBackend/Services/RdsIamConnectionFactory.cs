using Amazon;
using Amazon.RDS.Util;
using Microsoft.Extensions.Options;
using Npgsql;
using WardrobeBackend.Config;

namespace WardrobeBackend.Services
{
    public class RdsIamConnectionFactory : IDbConnectionFactory
    {
        private readonly DatabaseOptions _options;

        public RdsIamConnectionFactory(IOptions<DatabaseOptions> options)
        {
            _options = options.Value;
        }

        public async Task<NpgsqlConnection> CreateConnectionAsync()
        {
            string authToken = RDSAuthTokenGenerator.GenerateAuthToken(
                RegionEndpoint.GetBySystemName(_options.Region),
                _options.Host,
                _options.Port,
                _options.Username
            );

            var connString = $"Host={_options.Host};Port={_options.Port};Database={_options.Database};Username={_options.Username};Password={authToken};SSL Mode=Require;Trust Server Certificate=true";

            var conn = new NpgsqlConnection(connString);
            await conn.OpenAsync();
            return conn;
        }
    }
}