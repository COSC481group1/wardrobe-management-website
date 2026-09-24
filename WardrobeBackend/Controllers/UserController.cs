namespace WardrobeBackend.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WardrobeBackend.Objects;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<WardrobeController> _logger;
    private readonly ITokenProvider _tokenProvider;

    public UserController(ILogger<WardrobeController> logger, ITokenProvider tokenProvider)
    {
        _logger = logger;
        _tokenProvider = tokenProvider;
    }

    [HttpGet("token")]
    public object Get() =>
        _tokenProvider.CreateToken("LPRAW");
}

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

