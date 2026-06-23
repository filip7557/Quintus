using Quintus.Common;
using Quintus.Model;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class RequestService : IRequestService
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IImageService _imageService;
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;

        public RequestService(IRequestRepository requestRepository, IImageService imageService, IAuthService authService, IUserRepository userRepository)
        {
            _requestRepository = requestRepository;
            _imageService = imageService;
            _authService = authService;
            _userRepository = userRepository;
        }

        public async Task<bool> CreateRequestAsync(RequestDTO request)
        {
            var images = new List<Image>();

            foreach (var image in request.Images)
            {
                var img = await _imageService.AddImageAsync(image);
                if (img != null)
                {
                    images.Add(img);
                }
            }

            var currentUser = await _authService.GetCurrentUserAsync();
            if (currentUser == null || currentUser.Id == null)
            {
                throw new InvalidOperationException("Current user or user ID is null.");
            }

            var user = await _userRepository.GetUserByIdAsync(currentUser.Id.Value);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            var newRequest = new Request
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                RequestedBy = user,
                Images = images,
            };

            return await _requestRepository.AddRequestAsync(newRequest);
        }

        public async Task<PagedResult<RequestResponseDTO>> GetRequestsAsync(RequestFilter filter)
        {
            var paged = await _requestRepository.GetRequestsAsync(filter);
            return new PagedResult<RequestResponseDTO>
            {
                Items = paged.Items.Select(MapToDTO),
                TotalCount = paged.TotalCount,
                Page = paged.Page,
                PageSize = paged.PageSize
            };
        }

        public async Task<RequestResponseDTO?> GetRequestByIdAsync(Guid id)
        {
            var r = await _requestRepository.GetRequestByIdAsync(id);
            return r is null ? null : MapToDTO(r);
        }

        private static RequestResponseDTO MapToDTO(Request r) => new()
        {
            Id = r.Id,
            Title = r.Title,
            Description = r.Description,
            RequestedBy = r.RequestedBy.ToDataTransferObject(),
            ImageUrls = r.Images.Select(img => img.Url).ToList(),
            Status = r.Status.ToString(),
            CreatedAt = r.CreatedAt
        };
    }
}