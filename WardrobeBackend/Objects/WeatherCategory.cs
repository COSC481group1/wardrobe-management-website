namespace WardrobeBackend.Objects;

public enum TemperatureCategory
{
    Freezing,
    Cold,
    Chilly,
    Mild,
    Warm,
    Hot
}

public enum PrecipitationCategory
{
    None,
    Rain,
    Snow,
    Thunderstorm
}

public enum RainProbabilityCategory
{
    Unlikely,
    Possible,
    Likely,
    VeryLikely
}

public enum WindCategory
{
    Calm,
    Light,
    Breezy,
    Windy,
    VeryWindy
}

public record WeatherAnalysis(
    TemperatureCategory Temperature,
    PrecipitationCategory Precipitation,
    RainProbabilityCategory RainProbability,
    WindCategory Wind
);

