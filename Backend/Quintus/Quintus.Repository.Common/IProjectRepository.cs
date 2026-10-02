using Quintus.Common;
using Quintus.Common.Projects;
using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IProjectRepository
    {
        Task<PagedResult<ProjectResponse>> GetAsync(ProjectFilter filter);
        Task<ProjectResponse?> GetByIdAsync(Guid id);
        Task<GalleryProject?> GetEntityAsync(Guid id);
        Task SaveAsync(GalleryProject project);
        Task<PagedResult<ProjectPhotoResponse>> GetPhotosAsync(Guid id, ProjectFilter filter);
        Task<bool> AttachPhotoAsync(GalleryProjectImage photo);
        Task<bool> RemoveAsync(Guid id, Guid? photoId, Func<List<string>, Task> cleanup);
    }
}