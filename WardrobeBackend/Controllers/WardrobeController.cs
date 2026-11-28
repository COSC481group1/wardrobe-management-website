namespace WardrobeBackend.Controllers;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Mvc;
using WardrobeBackend.Entities;
using WardrobeBackend.Models;
using WardrobeBackend.Objects;
using WardrobeBackend.Services;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Authorize]
[Route("[controller]")]
public class WardrobeController : ControllerBase
{
    private string CurrentUserEmail =>
        User.Claims.First(c => c.Type == "Email").Value;

    private readonly ILogger<WardrobeController> _logger;
    private readonly IArticleService _articles;
    private readonly IOutfitService _outfits;    

    public WardrobeController(ILogger<WardrobeController> logger, IArticleService articles, IOutfitService outfits)
    {
        _logger = logger;
        _articles = articles;
        _outfits = outfits;
    }

    [HttpPost("article")]
    public async Task<IActionResult> AddArticle(ArticleDto articleDto, CancellationToken ct)
    {
        var saved = await _articles.SaveAsync(CurrentUserEmail, articleDto.ToEntity(), ct);
        return saved is null ? NotFound() : Ok(saved.ToDto());
    }

    [HttpGet("articles")]
    public async Task<ArticleDto[]> GetArticles(CancellationToken ct) =>
        [.. (await _articles.GetAllAsync(CurrentUserEmail, ct)).Select(a => a.ToDto())];

    [HttpPost("outfit")]
    public async Task<IActionResult> AddOutfit(OutfitDto outfitDto, CancellationToken ct)
    {
        var saved = await _outfits.SaveAsync(CurrentUserEmail, outfitDto.ToEntity(), ct);
        return saved is null ? NotFound() : Ok(saved.ToDto());
    }

   [HttpGet("outfits")]
    public async Task<OutfitDto[]> GetOutfits(CancellationToken ct) =>
        [.. (await _outfits.GetAllAsync(CurrentUserEmail, ct)).Select(o => o.ToDto())];

    [HttpPost("weather")]
    public async Task<IActionResult> ReceiveWeather(WeatherDto weather, CancellationToken ct)
    {
        if (weather.TemperatureF is < -100 or > 150 || weather.FeelsLikeF is < -100 or > 150 ||
            weather.WindSpeed is < 0 or > 200 ||
            weather.RainChance is < 0 or > 100)
            return BadRequest("Invalid weather values.");

        var analysis = WeatherAnalyzer.AnalyzeWeather(
            weather.FeelsLikeF,
            weather.Code,
            weather.RainChance,
            weather.WindSpeed
        );

        _logger.LogInformation(
            "Weather received: {Temp}F (feels {Feels}F), wind {Wind} mph, code {Code}, rain {Rain}%",
            weather.TemperatureF,
            weather.FeelsLikeF,
            weather.WindSpeed,
            weather.Code,
            weather.RainChance
        );

        _logger.LogInformation(
            "Weather analysis: Temperature {Temperature}, Precipitation {Precipitation}, Rain probability {RainProbability}, Wind {Wind}",
            analysis.Temperature,
            analysis.Precipitation,
            analysis.RainProbability,
            analysis.Wind
        );

        var requirements = ClothingRequirementGenerator.GenerateRequirements(analysis);
        var articles = (await _articles.GetAllAsync(CurrentUserEmail, ct)).ToList();

        foreach (var article in articles)
        {
            if (ArticleMatcher.IsWarmLayer(article))
            {
                _logger.LogInformation(
                    "Warm layer detected: {Name}",
                    article.Name
                );
            }
        }

        foreach (var requirement in requirements)
        {
            var matches = articles
                .Where(a => a.Category == requirement.Category)
                .Where(a =>
                    requirement.Reason == "Heavy outerwear for extreme cold"
                        ? ArticleMatcher.IsWarmLayer(a)
                        : true
                )
                .ToList();

            _logger.LogInformation(
                "Requirement {Category} ({Reason}) matched {Count} articles",
                requirement.Category,
                requirement.Reason,
                matches.Count
            );
        }

        foreach (var requirement in requirements)
        {
            _logger.LogInformation(
                "Clothing requirement: {Category} - {Reason}",
                requirement.Category,
                requirement.Reason
            );
        }

        return Ok();
    }
}