namespace WardrobeBackend.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using WardrobeBackend.Objects;
using WardrobeBackend.Services;

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

    [HttpGet("CreateAccount")]
    public async Task CreateUser(string username, string password) =>
        await Database.User.SaveUserAsync(username, password);

    [HttpGet("SignIn")]
    public object SignIn(string username, string password)
    {
        Database.User user = new();
        if (user.GetUser(username) && user.CheckPassword(password))
        {
            return _tokenProvider.CreateToken(username);
        }
        return BadRequest();
    }
}

