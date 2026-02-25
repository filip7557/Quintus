using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Quintus.Common;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        [EnableRateLimiting("LoginRegisterPolicy")]
        [HttpPost]
        public async Task<IActionResult> SendAsync([FromBody] ContactFormRequest request)
        {
            try
            {
                await _contactService.SendContactAsync(request);
                return Ok("Poruka je uspješno poslana.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, "Došlo je do pogreške prilikom slanja poruke.");
            }
        }
    }
}