using Microsoft.AspNetCore.Http;
using Quintus.Common;
using Quintus.Common.Projects;

namespace Quintus.Service.Common
{
    public interface IProjectService
    {
        Task<PagedResult<ProjectResponse>> GetAsync(ProjectFilter filter);
        Task<ProjectResponse?> GetByIdAsync(Guid id);
        Task<ProjectResponse> CreateAsync(ProjectRequest request);
        Task<ProjectResponse?> UpdateAsync(Guid id, ProjectRequest request);
        Task<PagedResult<ProjectPhotoResponse>?> GetPhotosAsync(Guid id, ProjectFilter filter);
        Task<ProjectPhotoResponse?> UploadAsync(Guid id, IFormFile file);
        Task<bool> DeleteAsync(Guid id, Guid? photoId = null);
    }
}