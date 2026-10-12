using Microsoft.AspNetCore.Mvc;

namespace OutfitApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeatherController : ControllerBase
{
    private readonly WeatherService _weather;

    public WeatherController(WeatherService weather) => _weather = weather;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(double lat, double lon)
    {
        var weather = await _weather.GetWeatherAsync(lat, lon);
        if (weather is null) return StatusCode(502);

        var start = WeatherSummarizer.GetLocationNow(weather);
        var end = start.Date.AddHours(22);   
        if (end <= start)
            end = start.AddHours(4);         

        var summary = WeatherSummarizer.Summarize(weather.Hourly, start, end);
        return Ok(summary);
    }
}