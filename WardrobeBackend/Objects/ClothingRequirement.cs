namespace WardrobeBackend.Objects;

using WardrobeBackend.Entities;

public class ClothingRequirement
{
    public Category Category { get; set; }
    public string Reason { get; set; } = string.Empty;
}