using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Quintus.Common;
using Quintus.Common.Projects;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }

        private static readonly Expression<Func<GalleryProject, ProjectResponse>> Projection = project => new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Address = project.Address,
            ClientName = project.ClientName,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            PhotoCount = project.Photos.Count,
            CoverUrl = project.Photos.OrderBy(photo => photo.CreatedAt).ThenBy(photo => photo.Id)
                .Select(photo => photo.Image.Url).FirstOrDefault()
        };

        public async Task<PagedResult<ProjectResponse>> GetAsync(ProjectFilter filter)
        {
            var query = _context.GalleryProjects.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.Trim().ToLower();
                query = query.Where(project => project.Name.ToLower().Contains(search)
                    || (project.Address != null && project.Address.ToLower().Contains(search))
                    || (project.ClientName != null && project.ClientName.ToLower().Contains(search)));
            }
            var count = await query.CountAsync();
            var page = Math.Min(filter.Page, Math.Max(1, (int)Math.Ceiling((double)count / filter.PageSize)));
            return new PagedResult<ProjectResponse>
            {
                Items = await query.OrderByDescending(project => project.CreatedAt).ThenBy(project => project.Id)
                    .Skip((page - 1) * filter.PageSize).Take(filter.PageSize).Select(Projection).ToListAsync(),
                TotalCount = count, Page = page, PageSize = filter.PageSize
            };
        }

        public Task<ProjectResponse?> GetByIdAsync(Guid id) =>
            _context.GalleryProjects.AsNoTracking().Where(project => project.Id == id).Select(Projection).FirstOrDefaultAsync();

        public Task<GalleryProject?> GetEntityAsync(Guid id) => _context.GalleryProjects.FindAsync(id).AsTask();

        public async Task SaveAsync(GalleryProject project)
        {
            if (_context.Entry(project).State == EntityState.Detached)
                _context.GalleryProjects.Add(project);
            await _context.SaveChangesAsync();
        }

        public async Task<PagedResult<ProjectPhotoResponse>> GetPhotosAsync(Guid id, ProjectFilter filter)
        {
            var query = _context.GalleryProjectImages.AsNoTracking().Where(photo => photo.ProjectId == id);
            var count = await query.CountAsync();
            var page = Math.Min(filter.Page, Math.Max(1, (int)Math.Ceiling((double)count / filter.PageSize)));
            return new PagedResult<ProjectPhotoResponse>
            {
                Items = await query.OrderBy(photo => photo.CreatedAt).ThenBy(photo => photo.Id)
                    .Skip((page - 1) * filter.PageSize).Take(filter.PageSize)
                    .Select(photo => new ProjectPhotoResponse { Id = photo.Id, Url = photo.Image.Url, CreatedAt = photo.CreatedAt }).ToListAsync(),
                TotalCount = count, Page = page, PageSize = filter.PageSize
            };
        }

        private async Task<GalleryProject?> LockAsync(Guid id) =>
            (await _context.GalleryProjects.FromSqlInterpolated($"SELECT * FROM \"GalleryProjects\" WHERE \"Id\" = {id} FOR UPDATE")
                .ToListAsync()).FirstOrDefault();

        public async Task<bool> AttachPhotoAsync(GalleryProjectImage photo)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var project = await LockAsync(photo.ProjectId);
            if (project == null)
                return false;
            try
            {
                _context.GalleryProjectImages.Add(photo);
                project.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                _context.Entry(photo).State = EntityState.Detached;
                _context.Entry(project).State = EntityState.Unchanged;
                throw;
            }
        }

        public async Task<bool> RemoveAsync(Guid id, Guid? photoId, Func<List<string>, Task> cleanup)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            var project = await LockAsync(id);
            if (project == null)
                return false;
            var query = _context.GalleryProjectImages.Include(photo => photo.Image).Where(photo => photo.ProjectId == id);
            if (photoId.HasValue)
                query = query.Where(photo => photo.Id == photoId.Value);
            var photos = await query.ToListAsync();
            if (photoId.HasValue && photos.Count == 0)
                return false;
            var urls = photos.Select(photo => photo.Image.Url).ToList();
            _context.GalleryProjectImages.RemoveRange(photos);
            if (!photoId.HasValue)
                _context.GalleryProjects.Remove(project);
            else
                project.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _context.Images.RemoveRange(photos.Select(photo => photo.Image));
            await _context.SaveChangesAsync();
            await cleanup(urls);
            await transaction.CommitAsync();
            return true;
        }
    }
}