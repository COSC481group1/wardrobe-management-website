namespace WardrobeBackend.Controllers;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Mvc;
using WardrobeBackend.Objects;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Authorize]
[Route("[controller]")]
public class WardrobeController : ControllerBase
{
    private readonly ILogger<WardrobeController> _logger;

    public WardrobeController(ILogger<WardrobeController> logger)
    {
        _logger = logger;
    }

    [HttpPost("article")]
    public void AddArticle(ArticleDto article)
    {
        string user = User.Claims.First(c => c.ValueType == "user").Value;
        if(!Article.dummyCache.TryGetValue(user, out List<Article>? articles))
        {
            articles = new List<Article>();
            Article.dummyCache.Add(user, articles);
        }
        articles.Add(Article.FromDto(article));
    }

    [HttpGet("{user}/articles")]
    public ArticleDto[] GetArticels(string user)
    {
        if(Article.dummyCache.TryGetValue(user, out List<Article>? articles))
        {
            return articles.Select(a => a.ToDto()).ToArray();
        }
        return [];
    }

    [HttpGet("test")]
    public object Test()
    {
        return new { Test = "Worked" };
    }
}

