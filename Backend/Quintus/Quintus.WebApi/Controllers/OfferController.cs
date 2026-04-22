using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfferController : ControllerBase
    {
        private readonly IOfferService _offerService;

        public OfferController(IOfferService offerService)
        {
            _offerService = offerService;
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet]
        public async Task<IActionResult> GetOffersAsync([FromQuery] OfferFilter filter)
        {
            var result = await _offerService.GetOffersAsync(filter);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{offerId}")]
        public async Task<IActionResult> GetOfferByIdAsync(Guid offerId)
        {
            var offer = await _offerService.GetOfferByIdAsync(offerId);
            if (offer == null) return NotFound();
            return Ok(offer);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> AddOfferAsync([FromBody] OfferDTO offer)
        {
            if (offer == null || offer.Items == null || offer.Items.Count == 0)
                return BadRequest("Neispravno ispunjena ponuda.");
            try
            {
                var result = await _offerService.AddOfferAsync(offer);
                return File(result.Value, "application/pdf", $"Ponuda_{result.Key:N}.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending pdf: {ex}");
                return StatusCode(500, "Nesto je poslo po zlu. Pokusajte kasnije.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{offerId}/pdf")]
        public async Task<IActionResult> GetOfferPdfAsync(Guid offerId)
        {
            try
            {
                var pdfBytes = await _offerService.GenerateOfferPdfAsync(offerId);
                return File(pdfBytes, "application/pdf", $"Ponuda_{offerId:N}.pdf");
            }
            catch (KeyNotFoundException) { return NotFound("Ponuda nije pronadjena."); }
            catch { return StatusCode(500, "Greska pri generiranju PDF-a."); }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("{offerId}/send-email")]
        public async Task<IActionResult> SendOfferEmailAsync(Guid offerId)
        {
            try
            {
                await _offerService.SendOfferEmailAsync(offerId);
                return Ok("Ponuda je uspjesno poslana kupcu.");
            }
            catch (KeyNotFoundException) { return NotFound("Ponuda nije pronadjena."); }
            catch { return StatusCode(500, "Greska pri slanju e-maila."); }
        }
    }
}