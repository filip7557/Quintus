using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quintus.Common.Projects;
using Quintus.Service.Common;

namespace Quintus.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Owner,Worker")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projects;

        public ProjectController(IProjectService projects)
        {
            _projects = projects;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync([FromQuery] ProjectFilter filter) => Ok(await _projects.GetAsync(filter));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var project = await _projects.GetByIdAsync(id);
            return project == null ? NotFound("Projekt nije pronađen.") : Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] ProjectRequest request)
        {
            try
            {
                var project = await _projects.CreateAsync(request);
                return Created($"/api/Project/{project.Id}", project);
            }
            catch (ArgumentException exception) { return BadRequest(exception.Message); }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] ProjectRequest request)
        {
            try
            {
                var project = await _projects.UpdateAsync(id, request);
                return project == null ? NotFound("Projekt nije pronađen.") : Ok(project);
            }
            catch (ArgumentException exception) { return BadRequest(exception.Message); }
        }

        [HttpGet("{id:guid}/images")]
        public async Task<IActionResult> GetPhotosAsync(Guid id, [FromQuery] ProjectFilter filter)
        {
            var photos = await _projects.GetPhotosAsync(id, filter);
            return photos == null ? NotFound("Projekt nije pronađen.") : Ok(photos);
        }

        [HttpPost("{id:guid}/images")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(22 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 22 * 1024 * 1024)]
        public async Task<IActionResult> UploadAsync(Guid id, [FromForm] IFormFile file)
        {
            try
            {
                var photo = await _projects.UploadAsync(id, file);
                return photo == null ? NotFound("Projekt nije pronađen.") : Ok(photo);
            }
            catch (ArgumentException exception) { return BadRequest(exception.Message); }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id) =>
            await _projects.DeleteAsync(id) ? NoContent() : NotFound("Projekt nije pronađen.");

        [HttpDelete("{id:guid}/images/{photoId:guid}")]
        public async Task<IActionResult> DeletePhotoAsync(Guid id, Guid photoId) =>
            await _projects.DeleteAsync(id, photoId) ? NoContent() : NotFound("Slika nije pronađena.");
    }
}