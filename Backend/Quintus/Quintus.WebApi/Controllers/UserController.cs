using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using System.Security.Claims;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserFilter filter)
        {
            return Ok(await _userService.GetUsersAsync(filter));
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            return Ok(await _userService.GetRolesAsync());
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{userId:guid}/role")]
        public async Task<IActionResult> AssignRole(Guid userId, [FromBody] RoleAssignmentRequest request)
        {
            try
            {
                var currentRole = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
                var updated = await _userService.AssignRoleAsync(userId, request.RoleId, currentRole);
                return updated ? Ok() : NotFound("Korisnik ili uloga nisu pronađeni.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{userId:guid}/color")]
        public async Task<IActionResult> UpdateColor(Guid userId, [FromBody] ColorUpdateRequest request)
        {
            try
            {
                var currentRole = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
                var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var updated = await _userService.UpdateColorAsync(userId, request.Color, currentUserId, currentRole);
                return updated ? Ok() : NotFound("Korisnik nije pronađen.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
        }
    }
}