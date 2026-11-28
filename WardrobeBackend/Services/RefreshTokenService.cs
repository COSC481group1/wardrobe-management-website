using System.Security.Cryptography;
using System.Text;

namespace WardrobeBackend.Services;

public class RefreshTokenService
{
    public string GenerateToken()
    {
        byte[] tokenBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(tokenBytes);
    }

    public string HashToken(string token)
    {
        byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hash);
    }
}