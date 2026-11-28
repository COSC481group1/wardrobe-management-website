
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

namespace WardrobeBackend.Controllers;

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

    private const int RefreshTokenDays = 30;

    [HttpPost("CreateAccount")]
    public async Task CreateUser(string username, string password) =>
        await Objects.User.SaveUserAsync(username, password);

    [HttpGet("SignIn")]
    public async Task<IActionResult> SignIn(string username, string password)
    {
        User user = new();

        if (user.GetUser(username) && user.CheckPassword(password))
        {
            string accessToken = _tokenProvider.CreateToken(username);
            string refreshToken = _tokenProvider.CreateRefreshToken();

            await RefreshToken.SaveAsync(
                username,
                refreshToken,
                DateTime.UtcNow.AddDays(RefreshTokenDays));

            return Ok(new
            {
                token = accessToken,
                refreshToken = refreshToken
            });
        }

        return BadRequest();
    }

    [HttpPost("Refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return Unauthorized();

        string? email = await RefreshToken.GetEmailAsync(request.RefreshToken);

        if (email == null)
            return Unauthorized(new { message = "Refresh token is invalid or expired." });

        // Revoke old refresh token (rotation).
        await RefreshToken.RevokeAsync(request.RefreshToken);

        // Issue new tokens.
        string newAccessToken = _tokenProvider.CreateToken(email);
        string newRefreshToken = _tokenProvider.CreateRefreshToken();

        await RefreshToken.SaveAsync(
            email,
            newRefreshToken,
            DateTime.UtcNow.AddDays(RefreshTokenDays));

        return Ok(new
        {
            token = newAccessToken,
            refreshToken = newRefreshToken
        });
    }

    [HttpPost("Logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            await RefreshToken.RevokeAsync(request.RefreshToken);

        return Ok(new { message = "Logged out." });
    }
}

public class RefreshRequest
{
    public string? RefreshToken { get; set; }
}
