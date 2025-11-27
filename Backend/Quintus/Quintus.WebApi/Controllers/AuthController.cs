using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Common.Exceptions;
using Quintus.Model;
using Quintus.Service.Common;
using System.Threading;
using System.Threading.Tasks;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IAuthService _authService;

        public AuthController(ITokenService tokenService, IAuthService authService)
        {
            _tokenService = tokenService;
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserDTO user)
        {
            // small delay to mitigate automated/bulk requests
            await Task.Delay(TimeSpan.FromSeconds(3), HttpContext.RequestAborted);

            if (user == null)
                return BadRequest();

            try
            {
                var success = await _tokenService.RegisterUserAsync(user);
                if (!success)
                    return StatusCode(500, "An error occurred during registration.");
            }
            catch (InvalidPasswordException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DuplicateUserException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred during registration.");
            }

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginInfo loginInfo)
        {
            // small delay to mitigate automated/bulk requests
            await Task.Delay(TimeSpan.FromSeconds(3), HttpContext.RequestAborted);

            if (string.IsNullOrWhiteSpace(loginInfo.email) || string.IsNullOrWhiteSpace(loginInfo.password))
                return BadRequest("Email i lozinka su potrebni.");
            try
            {
                var loginResponse = await _tokenService.LoginUserAsync(loginInfo.email, loginInfo.password);
                return Ok(loginResponse);
            }
            catch (Exception ex)
            {
                if (ex is InvalidLoginInfoException)
                    return Unauthorized(ex.Message);
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

        [Authorize]
        [HttpGet("getCurrentUser")]
        public async Task<IActionResult> GetCurrentUserAsync()
        {
            try
            {
                var user = await _authService.GetCurrentUserAsync();

                if (user == null)
                    return NotFound("Current user not found.");

                return Ok(user);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving the current user.");
            }
        }
    }
}