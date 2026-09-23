using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstimateController : ControllerBase
    {
        private readonly IEstimateService _estimateService;

        public EstimateController(IEstimateService estimateService)
        {
            _estimateService = estimateService;

        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet]
        public async Task<IActionResult> GetEstimatesAsync([FromQuery] OfferFilter filter)
        {
            var result = await _estimateService.GetEstimatesAsync(filter);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{estimateId}")]
        public async Task<IActionResult> GetEstimateByIdAsync(Guid estimateId)
        {
            var estimate = await _estimateService.GetEstimateByIdAsync(estimateId);
            if (estimate == null) return NotFound();
            return Ok(estimate);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> CreateEstimateAsync([FromBody] EstimateDTO estimate)
        {
            if (estimate == null || estimate.Items == null || estimate.Items.Count == 0)
            {
                return BadRequest("Neispravno ispunjen predračun.");
            }
            
            try
            {
                var result = await _estimateService.AddEstimateAsync(estimate);
                var createdEstimate = await _estimateService.GetEstimateByIdAsync(result.Key);
                var fileName = createdEstimate == null ? $"Predracun_{result.Key:N}.pdf" : EstimateFileNameFormatter.GetFileName(createdEstimate);
                Response.Headers["X-Estimate-Id"] = result.Key.ToString();
                return File(result.Value, "application/pdf", fileName);
            }
            catch (Exception)
            {
                return StatusCode(500, "Nešto je pošlo po zlu. Pokušajte kasnije.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{estimateId}/pdf")]
        public async Task<IActionResult> GetEstimatePdfAsync(Guid estimateId)
        {
            try
            {
                var estimate = await _estimateService.GetEstimateByIdAsync(estimateId);
                if (estimate == null)
                    return NotFound("Predračun nije pronađen.");

                var pdfBytes = await _estimateService.GenerateEstimatePdfAsync(estimateId);
                return File(pdfBytes, "application/pdf", EstimateFileNameFormatter.GetFileName(estimate));
            }
            catch (KeyNotFoundException) { return NotFound("Predračun nije pronađen."); }
            catch { return StatusCode(500, "Greška pri generiranju PDF-a."); }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("{estimateId}/send-email")]
        public async Task<IActionResult> SendEstimateEmailAsync(Guid estimateId)
        {
            try
            {
                await _estimateService.SendEstimateEmailAsync(estimateId);
                return Ok("Predračun je uspješno poslan kupcu.");
            }
            catch (KeyNotFoundException) { return NotFound("Predračun nije pronađen."); }
            catch { return StatusCode(500, "Greška pri slanju e-maila."); }
        }
    }
}
