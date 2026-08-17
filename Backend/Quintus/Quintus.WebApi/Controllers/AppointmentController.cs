using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Owner,Worker")]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByRange([FromQuery] DateTime weekStart, [FromQuery] DateTime weekEnd)
        {
            if (weekEnd <= weekStart)
                return BadRequest("Raspon tjedna nije valjan.");

            return Ok(await _appointmentService.GetByRangeAsync(weekStart, weekEnd));
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            return Ok(await _appointmentService.GetPendingAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AppointmentRequest request)
        {
            var appointment = await _appointmentService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { appointmentId = appointment!.Id }, appointment);
        }

        [HttpGet("{appointmentId:guid}")]
        public async Task<IActionResult> GetById(Guid appointmentId)
        {
            var appointment = await _appointmentService.GetByIdAsync(appointmentId);
            return appointment == null ? NotFound() : Ok(appointment);
        }

        [HttpPut("{appointmentId:guid}")]
        public async Task<IActionResult> Update(Guid appointmentId, [FromBody] AppointmentRequest request)
        {
            try
            {
                var appointment = await _appointmentService.UpdateAsync(appointmentId, request);
                return appointment == null ? NotFound() : Ok(appointment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
        }

        [HttpDelete("{appointmentId:guid}")]
        public async Task<IActionResult> Delete(Guid appointmentId)
        {
            try
            {
                var deleted = await _appointmentService.DeleteAsync(appointmentId);
                return deleted ? NoContent() : NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
        }
    }
}