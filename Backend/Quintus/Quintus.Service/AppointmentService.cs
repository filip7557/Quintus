using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Service.Common;

namespace Quintus.Service
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IAuthService _authService;

        public AppointmentService(IAppointmentRepository appointmentRepository, IAuthService authService)
        {
            _appointmentRepository = appointmentRepository;
            _authService = authService;
        }

        public async Task<List<AppointmentResponse>> GetByRangeAsync(DateTime weekStart, DateTime weekEnd)
        {
            return (await _appointmentRepository.GetByRangeAsync(weekStart.ToUniversalTime(), weekEnd.ToUniversalTime()))
                .Select(ToResponse)
                .ToList();
        }

        public async Task<List<AppointmentResponse>> GetPendingAsync()
        {
            return (await _appointmentRepository.GetPendingAsync())
                .Select(ToResponse)
                .ToList();
        }

            public async Task<AppointmentResponse?> GetByIdAsync(Guid appointmentId)
            {
                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                return appointment == null ? null : ToResponse(appointment);
            }

        public async Task<AppointmentResponse?> CreateAsync(AppointmentRequest request)
        {
            var currentUser = await _authService.GetCurrentUserAsync();
            if (currentUser?.Id == null)
                throw new UnauthorizedAccessException("Korisnik nije prijavljen.");

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                StartAt = request.StartAt?.ToUniversalTime(),
                EndAt = request.EndAt?.ToUniversalTime(),
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                CreatedByUserId = currentUser.Id.Value
            };

            var savedAppointment = await _appointmentRepository.AddAsync(appointment);
            var appointmentWithCreator = await _appointmentRepository.GetByIdAsync(savedAppointment.Id);
            return appointmentWithCreator == null ? null : ToResponse(appointmentWithCreator);
        }

        public async Task<AppointmentResponse?> UpdateAsync(Guid appointmentId, AppointmentRequest request)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
                return null;

            var currentUser = await _authService.GetCurrentUserAsync();
            if (currentUser?.Id == null)
                throw new UnauthorizedAccessException("Korisnik nije prijavljen.");

            var wasPending = appointment.StartAt == null;
            if (!wasPending && appointment.CreatedByUserId != currentUser.Id.Value)
                throw new UnauthorizedAccessException("Samo autor može uređivati termin.");

            appointment.Title = request.Title.Trim();
            appointment.StartAt = request.StartAt?.ToUniversalTime();
            appointment.EndAt = request.EndAt?.ToUniversalTime();
            appointment.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

            if (wasPending && appointment.StartAt != null)
                appointment.CreatedByUserId = currentUser.Id.Value;

            await _appointmentRepository.UpdateAsync(appointment);
            var updatedAppointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            return updatedAppointment == null ? null : ToResponse(updatedAppointment);
        }

        public async Task<bool> DeleteAsync(Guid appointmentId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
                return false;

            var currentUser = await _authService.GetCurrentUserAsync();
            if (currentUser?.Id == null)
                throw new UnauthorizedAccessException("Korisnik nije prijavljen.");

            var isAdmin = string.Equals(currentUser.Role?.Name, "Admin", StringComparison.OrdinalIgnoreCase);
            var isPending = appointment.StartAt == null;
            if (!isPending && !isAdmin && appointment.CreatedByUserId != currentUser.Id.Value)
                throw new UnauthorizedAccessException("Samo autor ili Admin može obrisati termin.");

            return await _appointmentRepository.DeleteAsync(appointment);
        }

        private static AppointmentResponse ToResponse(Appointment appointment)
        {
            var creator = appointment.CreatedByUser;

            return new AppointmentResponse
            {
                Id = appointment.Id,
                Title = appointment.Title,
                StartAt = appointment.StartAt,
                EndAt = appointment.EndAt,
                Notes = appointment.Notes,
                CreatedByUserId = appointment.CreatedByUserId,
                CreatedByName = creator == null
                    ? "Nepoznati korisnik"
                    : $"{creator.FirstName} {creator.LastName}".Trim(),
                CreatedByColor = creator == null || string.IsNullOrWhiteSpace(creator.Color)
                    ? "#91120c"
                    : creator.Color,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };
        }
    }
}