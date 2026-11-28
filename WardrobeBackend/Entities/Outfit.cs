namespace WardrobeBackend.Entities;

public class Outfit
{
    public int OutfitId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int HeadId { get; set; }
    public int OverShirtId { get; set; }
    public int UnderShirtId { get; set; }
    public int LegsId { get; set; }
    public int ShoeId { get; set; }
    public List<int> MiscIds { get; set; } = [];
}
