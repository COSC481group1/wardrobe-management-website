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
    private string CurrentUserEmail =>
        User.Claims.First(c => c.Type == "Email").Value;

    private readonly ILogger<WardrobeController> _logger;

    public WardrobeController(ILogger<WardrobeController> logger)
    {
        _logger = logger;
    }

    [HttpPost("article")]
    public void AddArticle(ArticleDto articleDto)
    {
        Article newArticle = Article.FromDto(articleDto);
        newArticle.CreateOrUpdate(CurrentUserEmail);
    }

    [HttpGet("articles")]
    public ArticleDto[] GetArticels() =>
        [.. new Article().FindAllInPlace(CurrentUserEmail).Select(a => a.ToDto())];

}

