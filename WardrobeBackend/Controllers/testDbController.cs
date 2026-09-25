using Microsoft.AspNetCore.Mvc;
using Npgsql;
using WardrobeBackend.Services;

namespace WardrobeBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestDbController : ControllerBase
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public TestDbController(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            await using var conn = await _connectionFactory.CreateConnectionAsync();
            await using var cmd = new NpgsqlCommand("SELECT version()", conn);
            var result = await cmd.ExecuteScalarAsync();
            return Ok(result?.ToString());
        }
    }
}