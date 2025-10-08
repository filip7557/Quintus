using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
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

        [HttpPost("Register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserDTO user)
        {
            if (user == null)
                return BadRequest();

            var success = await _tokenService.RegisterUserAsync(user);
            if (!success)
                return BadRequest("Registration failed. User may already exist or invalid data.");

            return Ok("User registered successfully.");
        }

        [HttpGet("Login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginInfo loginInfo)
        {
            if (string.IsNullOrWhiteSpace(loginInfo.email) || string.IsNullOrWhiteSpace(loginInfo.password))
                return BadRequest("Email and password are required.");
            var token = await _tokenService.LoginUserAsync(loginInfo.email, loginInfo.password);
            if (token == null)
                return Unauthorized("Invalid email or password.");
            return Ok(token);
        }
    }
}