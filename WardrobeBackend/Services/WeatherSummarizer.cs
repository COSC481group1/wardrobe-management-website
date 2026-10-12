using System.Globalization;

public record WeatherSummary(
    double MinFeelsLike,
    double MaxFeelsLike,
    double AvgFeelsLike,
    int MaxPrecipChance,
    double MaxWind,
    double MaxUv,
    string WarmthBand);

public static class WeatherSummarizer
{
    public static DateTime GetLocationNow(WeatherResponse weather)
    {
        var now = DateTime.Parse(weather.Current.Time, CultureInfo.InvariantCulture);
        return new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0);
    }

    public static WeatherSummary Summarize(HourlyData h, DateTime start, DateTime end)
    {
        var idx = Enumerable.Range(0, h.Time.Count)
            .Where(i =>
            {
                var t = DateTime.Parse(h.Time[i], CultureInfo.InvariantCulture);
                return t >= start && t <= end;
            })
            .ToList();

        if (idx.Count == 0)
            throw new ArgumentException("No hourly data in that window.");

        var temps = idx.Select(i => h.ApparentTemperature[i]).ToList();
        double min = temps.Min(), max = temps.Max(), avg = temps.Average();
        int maxPrecip = idx.Max(i => h.PrecipitationProbability[i] ?? 0);
        double maxWind = idx.Max(i => h.WindSpeed[i]);
        double maxUv = idx.Max(i => h.UvIndex[i]);

        string band = avg switch
        {
            < 32 => "freezing",
            < 45 => "cold",
            < 60 => "cool",
            < 72 => "mild",
            < 85 => "warm",
            _ => "hot"
        };

        return new WeatherSummary(min, max, avg, maxPrecip, maxWind, maxUv, band);
 
    }
}