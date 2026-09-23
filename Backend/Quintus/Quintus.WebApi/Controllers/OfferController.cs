using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Service.Common;
using System.Diagnostics;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfferController : ControllerBase
    {
        private readonly IOfferService _offerService;
        private readonly ILogger<OfferController> _logger;

        public OfferController(IOfferService offerService, ILogger<OfferController> logger)
        {
            _offerService = offerService;
            _logger = logger;
        }

        [Authorize(Roles = "Admin,Owner,Worker")]
        [HttpGet]
        public async Task<IActionResult> GetOffersAsync([FromQuery] OfferFilter filter)
        {
            var result = await _offerService.GetOffersAsync(filter);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Owner,Worker")]
        [HttpGet("{offerId}")]
        public async Task<IActionResult> GetOfferByIdAsync(Guid offerId)
        {
            var offer = await _offerService.GetOfferByIdAsync(offerId);
            if (offer == null) return NotFound();
            return Ok(offer);
        }

        [Authorize(Roles = "Admin,Owner,Worker")]
        [HttpPost]
        public async Task<IActionResult> AddOfferAsync([FromBody] OfferDTO offer)
        {
            if (offer == null || offer.Items == null || offer.Items.Count == 0)
            {
                _logger.LogWarning(
                    "Rejected invalid offer creation request {TraceIdentifier}.",
                    HttpContext.TraceIdentifier);
                return BadRequest("Neispravno ispunjena ponuda.");
            }

            var stopwatch = Stopwatch.StartNew();
            _logger.LogInformation(
                "Received offer creation request {TraceIdentifier} with {ItemCount} items. HasBuyerEmail: {HasBuyerEmail}.",
                HttpContext.TraceIdentifier,
                offer.Items.Count,
                !string.IsNullOrWhiteSpace(offer.BuyerEmail));

            try
            {
                var result = await _offerService.AddOfferAsync(offer);
                var createdOffer = await _offerService.GetOfferByIdAsync(result.Key);
                var fileName = createdOffer == null ? $"Ponuda_{result.Key:N}.pdf" : OfferFileNameFormatter.GetFileName(createdOffer);
                Response.Headers["X-Offer-Id"] = result.Key.ToString();
                _logger.LogInformation(
                    "Completed offer creation request {TraceIdentifier} for offer {OfferId} in {ElapsedMilliseconds} ms. PdfByteCount: {PdfByteCount}.",
                    HttpContext.TraceIdentifier,
                    result.Key,
                    stopwatch.ElapsedMilliseconds,
                    result.Value.Length);
                return File(result.Value, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Offer creation request {TraceIdentifier} failed after {ElapsedMilliseconds} ms. ItemCount: {ItemCount}, HasBuyerEmail: {HasBuyerEmail}.",
                    HttpContext.TraceIdentifier,
                    stopwatch.ElapsedMilliseconds,
                    offer.Items.Count,
                    !string.IsNullOrWhiteSpace(offer.BuyerEmail));
                return StatusCode(500, "Nešto je pošlo po zlu. Pokušajte kasnije.");
            }
        }

        [Authorize(Roles = "Admin,Owner,Worker")]
        [HttpGet("{offerId}/pdf")]
        public async Task<IActionResult> GetOfferPdfAsync(Guid offerId)
        {
            try
            {
                var offer = await _offerService.GetOfferByIdAsync(offerId);
                if (offer == null)
                    return NotFound("Ponuda nije pronadjena.");

                var pdfBytes = await _offerService.GenerateOfferPdfAsync(offerId);
                return File(pdfBytes, "application/pdf", OfferFileNameFormatter.GetFileName(offer));
            }
            catch (KeyNotFoundException) { return NotFound("Ponuda nije pronadjena."); }
            catch { return StatusCode(500, "Greska pri generiranju PDF-a."); }
        }

        [Authorize(Roles = "Admin,Owner,Worker")]
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
