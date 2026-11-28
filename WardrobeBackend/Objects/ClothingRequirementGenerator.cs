namespace WardrobeBackend.Objects;

using WardrobeBackend.Entities;

public static class ClothingRequirementGenerator
{
    public static List<ClothingRequirement> AnalyzeTemperature(TemperatureCategory temperature) =>
        temperature switch
        {
            TemperatureCategory.Freezing =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Insulation for freezing temperatures" },
                new ClothingRequirement { Category = Category.Overtop, Reason = "Heavy outerwear for extreme cold" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Leg coverage for freezing temperatures" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Foot protection from the cold" },
                new ClothingRequirement { Category = Category.Headwear, Reason = "Heat retention in freezing conditions" }
            ],

            TemperatureCategory.Cold =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Warm layers for cold temperatures" },
                new ClothingRequirement { Category = Category.Overtop, Reason = "Outer layer for cold weather" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Leg coverage in cold conditions" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Foot protection in cold conditions" }
            ],

            TemperatureCategory.Chilly =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Layering for chilly temperatures" },
                new ClothingRequirement { Category = Category.Overtop, Reason = "Light outer layer for chilly weather" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Leg coverage" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Footwear for outdoor conditions" }
            ],

            TemperatureCategory.Mild =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Comfortable clothing for mild temperatures" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Leg coverage appropriate for the weather" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Comfortable footwear" }
            ],

            TemperatureCategory.Warm =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Lightweight clothing for warm weather" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Lightweight lower-body clothing" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Breathable footwear" }
            ],

            TemperatureCategory.Hot =>
            [
                new ClothingRequirement { Category = Category.Undertop, Reason = "Breathable clothing for hot temperatures" },
                new ClothingRequirement { Category = Category.Bottom, Reason = "Lightweight clothing for heat" },
                new ClothingRequirement { Category = Category.Shoe, Reason = "Breathable footwear" }
            ],

            _ => []
        };

    public static List<ClothingRequirement> AnalyzeWind(WindCategory wind) =>
        wind switch
        {
            WindCategory.Breezy =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Wind-resistant outer layer"
                }
            ],

            WindCategory.Windy =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Protective outer layer for windy conditions"
                }
            ],

            WindCategory.VeryWindy =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Strong wind protection"
                },
                new ClothingRequirement
                {
                    Category = Category.Headwear,
                    Reason = "Head protection from strong winds"
                }
            ],

            _ => []
        };

    public static List<ClothingRequirement> AnalyzePrecipitation(PrecipitationCategory precipitation) =>
        precipitation switch
        {
            PrecipitationCategory.Rain =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Water-resistant outer layer for rain"
                },
                new ClothingRequirement
                {
                    Category = Category.Shoe,
                    Reason = "Footwear suitable for wet conditions"
                }
            ],

            PrecipitationCategory.Snow =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Outer layer for snow protection"
                },
                new ClothingRequirement
                {
                    Category = Category.Shoe,
                    Reason = "Footwear suitable for snow"
                },
                new ClothingRequirement
                {
                    Category = Category.Headwear,
                    Reason = "Head protection from snow and cold"
                }
            ],

            PrecipitationCategory.Thunderstorm =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Waterproof outer layer for thunderstorms"
                },
                new ClothingRequirement
                {
                    Category = Category.Shoe,
                    Reason = "Footwear suitable for wet conditions"
                }
            ],

            _ => []
        };

    public static List<ClothingRequirement> AnalyzeRainProbability(RainProbabilityCategory rainProbability) =>
        rainProbability switch
        {
            RainProbabilityCategory.Possible =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Prepare for potential rain"
                }
            ],

            RainProbabilityCategory.Likely =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Rain protection recommended"
                },
                new ClothingRequirement
                {
                    Category = Category.Shoe,
                    Reason = "Footwear suitable for possible rain"
                }
            ],

            RainProbabilityCategory.VeryLikely =>
            [
                new ClothingRequirement
                {
                    Category = Category.Overtop,
                    Reason = "Rain protection strongly recommended"
                },
                new ClothingRequirement
                {
                    Category = Category.Shoe,
                    Reason = "Footwear suitable for wet conditions"
                }
            ],

            _ => []
        };

    public static List<ClothingRequirement> GenerateRequirements(WeatherAnalysis analysis)
    {
        var requirements = new List<ClothingRequirement>();

        requirements.AddRange(AnalyzeTemperature(analysis.Temperature));
        requirements.AddRange(AnalyzeWind(analysis.Wind));
        requirements.AddRange(AnalyzePrecipitation(analysis.Precipitation));
        requirements.AddRange(AnalyzeRainProbability(analysis.RainProbability));

        return requirements;
    }
}