using Quintus.Common;

namespace Quintus.Service.Common
{
    public interface IAppointmentService
    {
        Task<List<AppointmentResponse>> GetByRangeAsync(DateTime weekStart, DateTime weekEnd);
        Task<List<AppointmentResponse>> GetPendingAsync();
        Task<AppointmentResponse?> GetByIdAsync(Guid appointmentId);
        Task<AppointmentResponse?> CreateAsync(AppointmentRequest request);
        Task<AppointmentResponse?> UpdateAsync(Guid appointmentId, AppointmentRequest request);
        Task<bool> DeleteAsync(Guid appointmentId);
    }
}