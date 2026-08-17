using Quintus.Model.Entities;

namespace Quintus.Repository.Common
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetByRangeAsync(DateTime weekStart, DateTime weekEnd);
        Task<List<Appointment>> GetPendingAsync();
        Task<Appointment?> GetByIdAsync(Guid appointmentId);
        Task<Appointment> AddAsync(Appointment appointment);
        Task<bool> UpdateAsync(Appointment appointment);
        Task<bool> DeleteAsync(Appointment appointment);
    }
}