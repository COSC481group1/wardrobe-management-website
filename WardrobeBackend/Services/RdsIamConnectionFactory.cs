using Amazon;
using Amazon.RDS.Util;
using Microsoft.Extensions.Options;
using Npgsql;
using WardrobeBackend.Config;

namespace WardrobeBackend.Services
{
    public class RdsIamConnectionFactory : IDbConnectionFactory
    {
        private readonly NpgsqlDataSource _dataSource;

        public RdsIamConnectionFactory(IOptions<DatabaseOptions> options)
        {
            var o = options.Value;
            var region = RegionEndpoint.GetBySystemName(o.Region);

            var csb = new NpgsqlConnectionStringBuilder
            {
                Host = o.Host,
                Port = o.Port,
                Database = o.Database,
                Username = o.Username,
                SslMode = SslMode.Require,
                Timeout = 45,        
                CommandTimeout = 60,
                MinPoolSize = 1,     
                KeepAlive = 30
            };

            var builder = new NpgsqlDataSourceBuilder(csb.ConnectionString);
            builder.UsePeriodicPasswordProvider(
                (_, _) => ValueTask.FromResult(
                    RDSAuthTokenGenerator.GenerateAuthToken(region, o.Host, o.Port, o.Username)),
                successRefreshInterval: TimeSpan.FromMinutes(10),   
                failureRefreshInterval: TimeSpan.FromSeconds(5));

            _dataSource = builder.Build();
        }
        public async Task<NpgsqlConnection> CreateConnectionAsync()
            => await _dataSource.OpenConnectionAsync();
    }
}