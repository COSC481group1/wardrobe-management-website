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
    public void AddArticle(ArticleDto articleDto) =>
        Article.FromDto(articleDto).CreateOrUpdate(CurrentUserEmail);
    
    [HttpPost("outfit")]
    public void AddOutfit(OutfitDto outfitDto) =>
        Outfit.FromDto(outfitDto).CreateOrUpdate(CurrentUserEmail);

    [HttpGet("articles")]
    public ArticleDto[] GetArticels() =>
        [.. new Article().FindAllInPlace(CurrentUserEmail).Select(a => a.ToDto())];

    [HttpGet("outfits")]
    public OutfitDto[] GetOutfits() =>
        [.. new Outfit().FindAllInPlace(CurrentUserEmail).Select(a => a.ToDto())];


    [HttpPost("weather")]
    public IActionResult ReceiveWeather(WeatherDto weather)
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

        return Ok();
    }
}

