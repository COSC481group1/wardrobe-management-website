using Microsoft.AspNetCore.Mvc;

namespace WardrobeBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WardrobeController : ControllerBase
    {
        private readonly ILogger<WardrobeController> _logger;

        public WardrobeController(ILogger<WardrobeController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("test")]
        public object Get()
        {
            return new
            {
                Name = "Wardrobe Application",
                Description = "A really cool program for managing your clothes"
            };
        }

        [HttpGet]
        [Route("clothes")]
        public object Fake()
        {
            return new
            {
                String = "Fake Object"
            };
        }
    }
}
