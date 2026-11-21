
using WardrobeBackend.Objects;

public class Outfit
{
    public static Outfit FromDto(OutfitDto dto) =>
    new()
    {
        outfitId = dto.OutfitId,
        name = dto.Name,
        description = dto.Description,
        headId = dto.HeadId,
        overShirtId = dto.OverShirtId,
        underShirtId = dto.UnderShirtId,
        legsId = dto.LegsId,
        shoeId = dto.ShoeId,
        miscIds = [.. dto.MiscIds]
    };

    public OutfitDto ToDto() =>
        new()
        {
            OutfitId = outfitId,
            Name = name,
            Description = description,
            HeadId = headId,
            OverShirtId = overShirtId,
            UnderShirtId = underShirtId,
            LegsId = legsId,
            ShoeId = shoeId,
            MiscIds = miscIds.ToArray()
        };

    public int outfitId;
    public string name;
    public string description;
    public int headId;
    public int overShirtId;
    public int underShirtId;
    public int legsId;
    public int shoeId;
    public List<int> miscIds;
    private bool created;


    public void CreateOrUpdate(string user)
    {
        if (created)
        {
            Update(user);
        }
        else
        {
            Create(user);
        }

    }

    private void Create(string user)
    {
        const string sql = @"
                INSERT INTO outfits (username, name, description, head_id, overshirt_id, undershirt_id, legs_id, shoe_id, misc_ids)
                VALUES (@username, @name, @description, @headId, @overShirtId, @underShirtId, @legsId, @shoeId, @miscIds);";

        using var connection = Database.ConnectionFactory.CreateConnectionAsync().Result;

        Database.RunNonQueryWithParameters(sql,
            ("username", user),
            ("name", name),
            ("description", description),
            ("headId", headId),
            ("overShirtId", overShirtId),
            ("underShirtId", underShirtId),
            ("legsId", legsId),
            ("shoeId", shoeId),
            ("miscIds", miscIds)).Wait();
        created = true;
    }

    private void Update(string user)
    {
        const string sql = @"
UPDATE outfits
SET name = @name,
description = @description,
head_id = @headId,
overshirt_id = @overShirtId,
undershirt_id = @underShirtId,
legs_id = @legsId,
shoe_id = @shoeId,
misc_ids = @miscIds,
where username = @user and id = @outfit_id
";

        Database.RunNonQueryWithParameters(sql,
            ("name", name),
            ("outfit_id", outfitId),
            ("description", description),
            ("headId", headId),
            ("overShirtId", overShirtId),
            ("underShirtId", underShirtId),
            ("legsId", legsId),
            ("shoeId", shoeId),
            ("user", user),
            ("miscIds", CrushMiscs())).Wait();
    }

    public IEnumerable<Outfit> FindAllInPlace(string user)
    {
        return Database.FindAll(r =>
        {
            name = r.GetString(0);
            description = r.GetString(1);
            headId = r.GetInt32(2);
            overShirtId = r.GetInt32(3);
            underShirtId = r.GetInt32(4);
            legsId = r.GetInt32(5);
            shoeId = r.GetInt32(6);
            miscIds = [.. UnrollMisc(r.GetString(7))];
            outfitId = r.GetInt32(8);
            return this;
        },
        @"SELECT name, description, head_id, overshirt_id, undershirt_id, legs_id, shoe_id, misc_ids, outfit_id FROM outfits WHERE username = @user",
        ("@user", user)).Result;
    }

    private string CrushMiscs()
    {
        if (miscIds == null || miscIds.Count == 0)
        {
            return "";
        }
        if (miscIds.Count == 1)
        {
            return miscIds[0].ToString();
        }
        return miscIds.Select(id => id.ToString()).Aggregate((t1, t2) => t1 + (char)8203 + t2);
    }

    private static int[] UnrollMisc(string ids) =>
        ids == ""
        ? []
        : ids.Split((char)8203).Select(int.Parse).ToArray();

}

