using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Model;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromForm] RequestDTO request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var result = await _requestService.CreateRequestAsync(request);

            if (result)
                return Ok("Request created successfully.");

            return StatusCode(500, "An error occurred while creating the request.");
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRequestsAsync([FromQuery] RequestFilter filter)
        {
            var result = await _requestService.GetRequestsAsync(filter);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestByIdAsync(Guid id)
        {
            var request = await _requestService.GetRequestByIdAsync(id);
            if (request == null)
                return NotFound("Request not found.");

            return Ok(request);
        }
    }
}