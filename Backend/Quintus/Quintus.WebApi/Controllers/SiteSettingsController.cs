using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common.SiteSettings;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SiteSettingsController : ControllerBase
    {
        private readonly ISiteSettingsService _siteSettingsService;

        public SiteSettingsController(ISiteSettingsService siteSettingsService)
        {
            _siteSettingsService = siteSettingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var settings = await _siteSettingsService.GetSiteSettingsAsync();
            return Ok(settings);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("heroBackgroundImage")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateHeroBackgroundImageAsync([FromForm] IFormFile file)
        {
            try
            {
                await _siteSettingsService.UpdateHeroBackgroundImageAsync(file);
                return Ok("Pozadinska slika je uspješno ažurirana.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom ažuriranja pozadinske slike.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("title")]
        public Task<IActionResult> UpdateTitleAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateTitleAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("description")]
        public Task<IActionResult> UpdateDescriptionAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateDescriptionAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("aboutUs")]
        public Task<IActionResult> UpdateAboutUsAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateAboutUsAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("aboutUsImage")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateAboutUsImageAsync([FromForm] IFormFile file)
        {
            try
            {
                await _siteSettingsService.UpdateAboutUsImageAsync(file);
                return Ok("Slika sekcije 'O nama' je uspješno ažurirana.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom ažuriranja slike sekcije 'O nama'.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("address")]
        public Task<IActionResult> UpdateAddressAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateAddressAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("phoneNumber")]
        public Task<IActionResult> UpdatePhoneNumberAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdatePhoneNumberAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("contactEmail")]
        public Task<IActionResult> UpdateContactEmailAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateContactEmailAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("oib")]
        public Task<IActionResult> UpdateOibAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateOibAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("brojObrtnice")]
        public Task<IActionResult> UpdateBrojObrtniceAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateBrojObrtniceAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("iban")]
        public Task<IActionResult> UpdateIbanAsync([FromBody] string value) =>
            UpdateAsync(() => _siteSettingsService.UpdateIbanAsync(value));

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("services")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddServiceAsync([FromForm] AddServiceToSiteSettingsRequest request)
        {
            try
            {
                var id = await _siteSettingsService.AddServiceAsync(request.Title, request.Description, request.Images, request.KeyWords);
                return Ok(new { Id = id, Message = "Usluga je uspješno dodana." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Došlo je do pogreške prilikom dodavanja usluge.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("services/{serviceId:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateServiceAsync(Guid serviceId, [FromForm] UpdateServiceInSiteSettingsRequest request)
        {
            try
            {
                var updated = await _siteSettingsService.UpdateServiceAsync(serviceId, request.Title, request.Description, request.Images, request.KeyWords);
                if (!updated)
                    return Ok("Nema promjena.");

                return Ok("Usluga je uspješno ažurirana.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom ažuriranja usluge.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("services/{serviceId:guid}")]
        public async Task<IActionResult> DeleteServiceAsync(Guid serviceId)
        {
            try
            {
                var deleted = await _siteSettingsService.DeleteServiceAsync(serviceId);
                if (!deleted)
                    return NotFound("Usluga nije pronađena.");

                return Ok("Usluga je uspješno obrisana.");
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom brisanja usluge.");
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("services/reorder")]
        public async Task<IActionResult> ReorderServicesAsync([FromBody] ReorderServicesRequest request)
        {
            if (request == null || request.OrderedServiceIds == null || request.OrderedServiceIds.Count == 0)
                return BadRequest("Popis ID-jeva je obavezan.");

            try
            {
                var changed = await _siteSettingsService.ReorderServicesAsync(request.OrderedServiceIds);
                if (!changed)
                    return Ok("Nema promjena.");

                return Ok("Redoslijed usluga je uspješno ažuriran.");
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom ažuriranja redoslijeda usluga.");
            }
        }

        private async Task<IActionResult> UpdateAsync(Func<Task> update)
        {
            try
            {
                await update();
                return Ok("Postavke su uspješno ažurirane.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(500, "Došlo je do pogreške prilikom ažuriranja postavki.");
            }
        }
    }
}
