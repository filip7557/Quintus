using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _context;

        public AppointmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<List<Appointment>> GetByRangeAsync(DateTime weekStart, DateTime weekEnd)
        {
            return _context.Appointments
                .Include(appointment => appointment.CreatedByUser)
                .Where(appointment => appointment.StartAt != null && appointment.StartAt < weekEnd &&
                    (
                        (appointment.RepeatUntil == null && (appointment.EndAt == null || appointment.EndAt > weekStart)) ||
                        (appointment.RepeatUntil != null && appointment.RepeatUntil.Value.Date.AddDays(1) > weekStart)
                    ))
                .OrderBy(appointment => appointment.StartAt)
                .ToListAsync();
        }

        public Task<List<Appointment>> GetPendingAsync()
        {
            return _context.Appointments
                .Include(appointment => appointment.CreatedByUser)
                .Where(appointment => appointment.StartAt == null)
                .OrderBy(appointment => appointment.CreatedAt)
                .ToListAsync();
        }

        public Task<Appointment?> GetByIdAsync(Guid appointmentId)
        {
            return _context.Appointments
                .Include(appointment => appointment.CreatedByUser)
                .FirstOrDefaultAsync(appointment => appointment.Id == appointmentId);
        }

        public async Task<Appointment> AddAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<bool> UpdateAsync(Appointment appointment)
        {
            appointment.UpdatedAt = DateTime.UtcNow;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Appointment appointment)
        {
            _context.Appointments.Remove(appointment);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}