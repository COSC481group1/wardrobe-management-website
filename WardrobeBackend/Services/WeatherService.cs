using System.Net.Http.Json;

public class WeatherService
{
    private readonly HttpClient _http;

    public WeatherService(HttpClient http) => _http = http;

    public async Task<WeatherResponse?> GetWeatherAsync(double lat, double lon)
    {
        var url = "https://api.open-meteo.com/v1/forecast" +
                  $"?latitude={lat}&longitude={lon}" +
                  "&current=apparent_temperature,precipitation,wind_speed_10m" +
                  "&hourly=apparent_temperature,precipitation_probability,wind_speed_10m,uv_index" +
                  "&daily=apparent_temperature_max,apparent_temperature_min,precipitation_probability_max" +
                  "&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1";

        return await _http.GetFromJsonAsync<WeatherResponse>(url);
    }
}