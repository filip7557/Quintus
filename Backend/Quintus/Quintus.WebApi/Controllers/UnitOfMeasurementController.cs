using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitOfMeasurementController : ControllerBase
    {
        private readonly IUnitOfMeasurementService _unitOfMeasurementService;

        public UnitOfMeasurementController(IUnitOfMeasurementService unitOfMeasurementService)
        {
            _unitOfMeasurementService = unitOfMeasurementService;
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var result = await _unitOfMeasurementService.GetAllAsync();
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> AddAsync([FromBody] string name)
        {
            try
            {
                var result = await _unitOfMeasurementService.AddAsync(name);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            var deleted = await _unitOfMeasurementService.DeleteAsync(id);
            if (!deleted)
                return NotFound("Unit of measurement not found.");

            return Ok("Unit of measurement deleted.");
        }
    }
}
