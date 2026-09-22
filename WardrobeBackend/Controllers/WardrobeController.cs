namespace WardrobeBackend.Controllers;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Mvc;
using WardrobeBackend.Objects;


[ApiController]
[Route("[controller]")]
public class WardrobeController : ControllerBase
{
    private readonly ILogger<WardrobeController> _logger;

    public WardrobeController(ILogger<WardrobeController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    [Route("{user}/article")]
    public void AddArticle(string user, ArticleDto article)
    {
        if(!Article.dummyCache.TryGetValue(user, out List<Article>? articles))
        {
            articles = new List<Article>();
            Article.dummyCache.Add(user, articles);
        }
        articles.Add(Article.FromDto(article));
    }

    [HttpGet]
    [Route("{user}/articles")]
    public ArticleDto[] GetArticels(string user)
    {
        if(Article.dummyCache.TryGetValue(user, out List<Article>? articles))
        {
            return articles.Select(a => a.ToDto()).ToArray();
        }
        return [];
    }

    [HttpGet]
    [Route("test")]
    public object Test()
    {
        return new { Test = "Worked" };
    }
}

