using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("owners/{userId:guid}")]
        public async Task<IActionResult> PromoteToOwnerAsync(Guid userId)
        {
            try
            {
                var ok = await _userService.PromoteToOwnerAsync(userId);
                if (!ok)
                    return NotFound("Korisnik ili uloga nisu prona?eni.");

                return Ok("Korisnik je uspješno dodan u vlasnike.");
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom dodavanja vlasnika.");
            }
        }

        [HttpGet("owners")]
        public async Task<IActionResult> GetOwnersAsync()
        {
            try
            {
                var owners = await _userService.GetOwnersAsync();
                return Ok(owners);
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom dohva?anja popisa vlasnika.");
            }
        }
    }
}
