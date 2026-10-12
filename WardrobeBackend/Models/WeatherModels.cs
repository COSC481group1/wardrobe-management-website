using System.Text.Json.Serialization;

public class WeatherResponse
{
    [JsonPropertyName("hourly")] public HourlyData Hourly { get; set; } = new();
    [JsonPropertyName("daily")] public DailyData Daily { get; set; } = new();
    [JsonPropertyName("current")] public CurrentData Current { get; set; } = new();
}

public class HourlyData
{
    [JsonPropertyName("time")] public List<string> Time { get; set; } = new();
    [JsonPropertyName("apparent_temperature")] public List<double> ApparentTemperature { get; set; } = new();
    [JsonPropertyName("precipitation_probability")] public List<int?> PrecipitationProbability { get; set; } = new();
    [JsonPropertyName("wind_speed_10m")] public List<double> WindSpeed { get; set; } = new();
    [JsonPropertyName("uv_index")] public List<double> UvIndex { get; set; } = new();
}

public class DailyData
{
    [JsonPropertyName("apparent_temperature_max")] public List<double> ApparentTemperatureMax { get; set; } = new();
    [JsonPropertyName("apparent_temperature_min")] public List<double> ApparentTemperatureMin { get; set; } = new();
    [JsonPropertyName("precipitation_probability_max")] public List<int?> PrecipitationProbabilityMax { get; set; } = new();
}

public class CurrentData
{
    [JsonPropertyName("time")] public string Time { get; set; } = "";
    [JsonPropertyName("apparent_temperature")] public double ApparentTemperature { get; set; }
    [JsonPropertyName("precipitation")] public double Precipitation { get; set; }
    [JsonPropertyName("wind_speed_10m")] public double WindSpeed { get; set; }
}