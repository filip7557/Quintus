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

        public RequestService(IRequestRepository requestRepository, IImageService imageService, IAuthService authService)
        {
            _requestRepository = requestRepository;
            _imageService = imageService;
            _authService = authService;
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

            var newRequest = new Request
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                RequestedBy = currentUser!,
                Images = images,
            };

            return await _requestRepository.AddRequestAsync(newRequest);
        }

        public async Task<IEnumerable<RequestResponseDTO>> GetAllRequestsAsync()
        {
            return (await _requestRepository.GetAllRequestsAsync()).Select(r => new RequestResponseDTO
            {
                Title = r.Title,
                Description = r.Description,
                RequestedBy = r.RequestedBy.ToDataTransferObject(),
                ImageUrls = r.Images.Select(img => img.Url).ToList(),
            });
        }

        public async Task<RequestResponseDTO?> GetRequestByIdAsync(Guid id)
        {
            return (await _requestRepository.GetRequestByIdAsync(id)) is Request r ? new RequestResponseDTO
            {
                Title = r.Title,
                Description = r.Description,
                RequestedBy = r.RequestedBy.ToDataTransferObject(),
                ImageUrls = r.Images.Select(img => img.Url).ToList(),
            } : null;
        }
    }
}