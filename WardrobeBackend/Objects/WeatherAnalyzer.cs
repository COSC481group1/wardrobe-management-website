namespace WardrobeBackend.Objects;

public static class WeatherAnalyzer
{
    public static TemperatureCategory AnalyzeTemperature(double feelsLikeF) =>
        feelsLikeF switch
        {
            <= 32 => TemperatureCategory.Freezing,
            <= 45 => TemperatureCategory.Cold,
            <= 55 => TemperatureCategory.Chilly,
            <= 70 => TemperatureCategory.Mild,
            <= 80 => TemperatureCategory.Warm,
            _ => TemperatureCategory.Hot
        };

    public static PrecipitationCategory AnalyzePrecipitation(int code) =>
        code switch
        {
            51 or 53 or 55 or 56 or 57
            or 61 or 63 or 65 or 66 or 67
            or 80 or 81 or 82 => PrecipitationCategory.Rain,

            71 or 73 or 75 or 77 or 85 or 86 => PrecipitationCategory.Snow,

            95 or 96 or 99 => PrecipitationCategory.Thunderstorm,

            _ => PrecipitationCategory.None
        };

    public static RainProbabilityCategory AnalyzeRainProbability(double? rainChance) =>
        rainChance switch
        {
            null or < 20 => RainProbabilityCategory.Unlikely,
            < 50 => RainProbabilityCategory.Possible,
            < 80 => RainProbabilityCategory.Likely,
            _ => RainProbabilityCategory.VeryLikely
        };

    public static WindCategory AnalyzeWind(double windSpeed) =>
        windSpeed switch
        {
            <= 4  => WindCategory.Calm,
            <= 10 => WindCategory.Light,
            <= 20 => WindCategory.Breezy,
            <= 30 => WindCategory.Windy,
            _     => WindCategory.VeryWindy
        };

    public static WeatherAnalysis AnalyzeWeather(
        double feelsLikeF,
        int code,
        double? rainChance,
        double windSpeed
    ) =>
        new WeatherAnalysis(
            AnalyzeTemperature(feelsLikeF),
            AnalyzePrecipitation(code),
            AnalyzeRainProbability(rainChance),
            AnalyzeWind(windSpeed)
        );
}