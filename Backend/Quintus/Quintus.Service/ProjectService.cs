using Microsoft.AspNetCore.Http;
using Quintus.Common;
using Quintus.Common.Projects;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projects;
        private readonly IImageService _images;
        private readonly IStorageCleanupService _cleanup;
        private readonly IS3Service _s3Service;

        public ProjectService(IProjectRepository projects, IImageService images, IStorageCleanupService cleanup, IS3Service s3Service)
        {
            _projects = projects;
            _images = images;
            _cleanup = cleanup;
            _s3Service = s3Service;
        }

        public Task<PagedResult<ProjectResponse>> GetAsync(ProjectFilter filter) => _projects.GetAsync(filter);
        public Task<ProjectResponse?> GetByIdAsync(Guid id) => _projects.GetByIdAsync(id);

        private static void Apply(GalleryProject project, ProjectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Naziv projekta je obavezan.");
            project.Name = request.Name.Trim();
            project.Description = Normalize(request.Description);
            project.Address = Normalize(request.Address);
            project.ClientName = Normalize(request.ClientName);
            project.UpdatedAt = DateTime.UtcNow;
        }

        private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        public async Task<ProjectResponse> CreateAsync(ProjectRequest request)
        {
            var project = new GalleryProject { Name = request.Name };
            Apply(project, request);
            await _projects.SaveAsync(project);
            return (await _projects.GetByIdAsync(project.Id))!;
        }

        public async Task<ProjectResponse?> UpdateAsync(Guid id, ProjectRequest request)
        {
            var project = await _projects.GetEntityAsync(id);
            if (project == null)
                return null;
            Apply(project, request);
            await _projects.SaveAsync(project);
            return await _projects.GetByIdAsync(id);
        }

        public async Task<PagedResult<ProjectPhotoResponse>?> GetPhotosAsync(Guid id, ProjectFilter filter)
        {
            if (await _projects.GetByIdAsync(id) == null)
                return null;
            return await _projects.GetPhotosAsync(id, filter);
        }

        public async Task<string?> GetPhotoDownloadUrlAsync(Guid projectId, Guid photoId)
        {
            var imageUrl = await _projects.GetPhotoUrlAsync(projectId, photoId);
            return imageUrl == null ? null : _s3Service.GetDownloadUrl(imageUrl, $"project-photo-{photoId:N}.webp");
        }

        public async Task<ProjectPhotoResponse?> UploadAsync(Guid id, IFormFile file)
        {
            if (await _projects.GetByIdAsync(id) == null)
                return null;
            var image = await _images.AddImageAsync(file)
                ?? throw new InvalidOperationException("Slika nije spremljena. Pokušajte ponovno.");
            var photo = new GalleryProjectImage { ProjectId = id, ImageId = image.Id };
            bool attached;
            try
            {
                attached = await _projects.AttachPhotoAsync(photo);
            }
            catch
            {
                await _cleanup.EnqueueDeleteAsync(image.Url);
                throw;
            }
            if (!attached)
            {
                await _cleanup.EnqueueDeleteAsync(image.Url);
                return null;
            }
            return new ProjectPhotoResponse { Id = photo.Id, Url = image.Url, CreatedAt = photo.CreatedAt };
        }

        public Task<bool> DeleteAsync(Guid id, Guid? photoId = null) =>
            _projects.RemoveAsync(id, photoId, urls => _cleanup.EnqueueDeleteAsync(urls));
    }
}