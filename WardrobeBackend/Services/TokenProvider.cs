using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace WardrobeBackend.Services
{
    public interface ITokenProvider
    {
        string CreateToken(string email);
    }

    public class TokenProvider : ITokenProvider
    {
        public const string SecureKey = @"SecureKey:)!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!
!!! key !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";

        public string CreateToken(string email) =>
            new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(new List<Claim>
                {
                new("Email", email),
                }),
                Expires = DateTime.UtcNow.AddMinutes(60),
                Issuer = Program.Me,
                Audience = Program.Me,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecureKey)), SecurityAlgorithms.HmacSha256)
            });
    }
}
