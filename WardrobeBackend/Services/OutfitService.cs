using WardrobeBackend.Entities;
using WardrobeBackend.Repositories;

namespace WardrobeBackend.Services;

public interface IOutfitService
{
    Task<IReadOnlyList<Outfit>> GetAllAsync(string user, CancellationToken ct = default);

    Task<Outfit?> SaveAsync(string user, Outfit outfit, CancellationToken ct = default);
}

public sealed class OutfitService(IOutfitRepository repository) : IOutfitService
{
    public Task<IReadOnlyList<Outfit>> GetAllAsync(string user, CancellationToken ct = default) =>
        repository.GetAllForUserAsync(user, ct);

    public async Task<Outfit?> SaveAsync(string user, Outfit outfit, CancellationToken ct = default)
    {
        if (outfit.OutfitId == 0)
            return await repository.CreateAsync(user, outfit, ct);

        return await repository.UpdateAsync(user, outfit, ct) ? outfit : null;
    }
}
