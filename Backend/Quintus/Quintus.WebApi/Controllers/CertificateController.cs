using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Model.Entities;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class CertificateController : ControllerBase
    {
        private readonly ICertificateService _certificateService;

        public CertificateController(ICertificateService certificateService)
        {
            _certificateService = certificateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCertificatesAsync()
        {
            var certificates = await _certificateService.GetAllCertificatesAsync();
            return Ok(certificates);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> AddCertificateAsync([FromForm] CertificateDTO certificate)
        {
            var result = await _certificateService.AddCertificateAsync(certificate);
            if (!result)
            {
                return BadRequest("Greška pri dodavanju certifikata.");
            }
            return Ok();
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCertificateAsync(Guid id, [FromBody] CertificateUpdateDTO certificate)
        {
            if (certificate == null) return BadRequest("Podaci o certifikatu su obavezni.");
            var result = await _certificateService.UpdateCertificateAsync(certificate, id);
            if (!result)
            {
                return BadRequest("Greška pri ažuriranju certifikata.");
            }
            return Ok();
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("image/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateCertificateImageAsync(Guid id, [FromForm] IFormFile image)
        {
            if (image == null) return BadRequest("Slika certifikata je obavezna.");
            var result = await _certificateService.UpdateCertificateImageAsync(id, image);
            if (!result)
            {
                return BadRequest("Greška pri ažuriranju slike certifikata.");
            }
            return Ok();
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertificateAsync(Guid id)
        {
            var result = await _certificateService.DeleteCertificateAsync(id);
            if (!result)
            {
                return BadRequest("Greška pri brisanju certifikata.");
            }
            return Ok();
        }
    }
}
