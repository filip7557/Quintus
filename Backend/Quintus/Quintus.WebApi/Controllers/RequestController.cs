using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            if (request == null || string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Invalid request data.");
            }

            var result = await _requestService.CreateRequestAsync(request);

            if (result)
            {
                return Ok("Request created successfully.");
            }
            return StatusCode(500, "An error occurred while creating the request.");
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllRequests()
        {
            // TODO: Add filtering and sorting options.
            var requests = await _requestService.GetAllRequestsAsync();
            return Ok(requests);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestById(Guid id)
        {
            var request = await _requestService.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound("Request not found.");
            }
            return Ok(request);
        }
    }
}