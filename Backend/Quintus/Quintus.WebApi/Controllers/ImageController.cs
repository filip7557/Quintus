using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IImageService _imageService;

        public ImageController(IImageService imageService)
        {
            _imageService = imageService;
        }

        [Authorize]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImageAsync(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("No image file provided.");
            }
            var result = await _imageService.AddImageAsync(image);
            if (result != null)
            {
                return Ok("Image uploaded successfully.");
            }
            return StatusCode(500, "An error occurred while uploading the image.");
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageByIdAsync(Guid id)
        {
            var image = await _imageService.GetImageByIdAsync(id);
            if (image == null)
                return NotFound();
            return Ok(image.Url);
        }
    }
}