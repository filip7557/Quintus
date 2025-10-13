using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Common.Exceptions;
using Quintus.Model;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;

        public AuthController(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserDTO user)
        {
            if (user == null)
                return BadRequest();

            var success = await _tokenService.RegisterUserAsync(user);
            if (!success)
                return BadRequest("Registration failed. User may already exist or invalid data.");

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginInfo loginInfo)
        {
            if (string.IsNullOrWhiteSpace(loginInfo.email) || string.IsNullOrWhiteSpace(loginInfo.password))
                return BadRequest("Email and password are required.");
            try
            {
                var loginResponse = await _tokenService.LoginUserAsync(loginInfo.email, loginInfo.password);
                return Ok(loginResponse);
            }
            catch (Exception ex)
            {
                if (ex is InvalidLoginInfoException)
                    return Unauthorized("Invalid email or password.");
                else
                    return StatusCode(500, "An error occurred during login.");
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> LogoutAsync()
        {
            await _tokenService.LogoutUserAsync();
            return Ok("Logged out successfully.");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshInfo refreshInfo)
        {
            if (string.IsNullOrWhiteSpace(refreshInfo.Token))
                return BadRequest("Refresh token is required.");
            try
            {
                var loginResponse = await _tokenService.RefreshTokenAsync(refreshInfo.Token);
                return Ok(loginResponse);
            }
            catch (Exception ex)
            {
                if (ex is InvalidRefreshTokenException)
                    return Unauthorized("Invalid refresh token.");
                else if (ex is InactiveRefreshTokenException)
                    return Unauthorized("Refresh token is inactive or revoked.");
                else
                    return StatusCode(500, "An error occurred while refreshing the token.");
            }
        }
    }
}