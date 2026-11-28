using WardrobeBackend.Entities;

namespace WardrobeBackend.Models;

public static class OutfitMapper
{
    public static Outfit ToEntity(this OutfitDto dto) => new()
    {
        OutfitId = dto.OutfitId,
        Name = dto.Name ?? "",
        Description = dto.Description ?? "",
        HeadId = dto.HeadId,
        OverShirtId = dto.OverShirtId,
        UnderShirtId = dto.UnderShirtId,
        LegsId = dto.LegsId,
        ShoeId = dto.ShoeId,
        MiscIds = [.. dto.MiscIds ?? []],
    };

    public static OutfitDto ToDto(this Outfit outfit) => new()
    {
        OutfitId = outfit.OutfitId,
        Name = outfit.Name,
        Description = outfit.Description,
        HeadId = outfit.HeadId,
        OverShirtId = outfit.OverShirtId,
        UnderShirtId = outfit.UnderShirtId,
        LegsId = outfit.LegsId,
        ShoeId = outfit.ShoeId,
        MiscIds = outfit.MiscIds.ToArray(),
    };
}
