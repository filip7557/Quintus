using Microsoft.EntityFrameworkCore;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Repository.Context;

namespace Quintus.Repository
{
    public class PushNotificationJobRepository : IPushNotificationJobRepository
    {
        private readonly AppDbContext _context;

        public PushNotificationJobRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task EnqueueAsync(PushNotificationJob job)
        {
            _context.PushNotificationJobs.Add(job);
            await _context.SaveChangesAsync();
        }

        public async Task<List<PushNotificationJob>> ClaimDueAsync(int maximumCount, DateTime now)
        {
            var staleBefore = now.AddMinutes(-5);
            var jobs = await _context.PushNotificationJobs
                .Where(job => job.CompletedAt == null &&
                    (job.NextAttemptAt == null || job.NextAttemptAt <= now) &&
                    (job.ProcessingStartedAt == null || job.ProcessingStartedAt < staleBefore))
                .OrderBy(job => job.CreatedAt)
                .Take(maximumCount)
                .ToListAsync();

            foreach (var job in jobs)
                job.ProcessingStartedAt = now;

            if (jobs.Count > 0)
                await _context.SaveChangesAsync();

            return jobs;
        }

        public async Task CompleteAsync(Guid jobId)
        {
            var job = await _context.PushNotificationJobs.FindAsync(jobId);
            if (job == null)
                return;

            job.CompletedAt = DateTime.UtcNow;
            job.ProcessingStartedAt = null;
            job.LastError = null;
            await _context.SaveChangesAsync();
        }

        public async Task RetryAsync(Guid jobId, int attemptCount, DateTime nextAttemptAt, string error)
        {
            var job = await _context.PushNotificationJobs.FindAsync(jobId);
            if (job == null)
                return;

            job.AttemptCount = attemptCount;
            job.NextAttemptAt = nextAttemptAt;
            job.ProcessingStartedAt = null;
            job.LastError = error;
            await _context.SaveChangesAsync();
        }

        public async Task FailAsync(Guid jobId, int attemptCount, string error)
        {
            var job = await _context.PushNotificationJobs.FindAsync(jobId);
            if (job == null)
                return;

            job.AttemptCount = attemptCount;
            job.CompletedAt = DateTime.UtcNow;
            job.ProcessingStartedAt = null;
            job.LastError = error;
            await _context.SaveChangesAsync();
        }
    }
}