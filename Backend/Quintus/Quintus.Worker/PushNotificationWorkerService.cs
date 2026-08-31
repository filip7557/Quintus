using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using System.Globalization;
using System.Net;
using System.Text.Json;
using WebPush;
using WebPushSubscription = WebPush.PushSubscription;

namespace Quintus.Worker
{
    public class PushNotificationWorkerService : BackgroundService
    {
        private const int MaximumAttempts = 5;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<PushNotificationWorkerService> _logger;
        private readonly PushNotificationOptions _options;

        public PushNotificationWorkerService(IServiceScopeFactory scopeFactory, IOptions<PushNotificationOptions> options, ILogger<PushNotificationWorkerService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.IsConfigured)
            {
                _logger.LogWarning("Web Push delivery is disabled because VAPID configuration is incomplete.");
                return;
            }

            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var jobs = scope.ServiceProvider.GetRequiredService<IPushNotificationJobRepository>();
                var subscriptions = scope.ServiceProvider.GetRequiredService<IPushSubscriptionRepository>();
                var dueJobs = await jobs.ClaimDueAsync(20, DateTime.UtcNow);

                foreach (var job in dueJobs)
                    await DeliverAsync(job, jobs, subscriptions, stoppingToken);
            }
        }

        private async Task DeliverAsync(PushNotificationJob job, IPushNotificationJobRepository jobs, IPushSubscriptionRepository subscriptions, CancellationToken cancellationToken)
        {
            try
            {
                var recipients = await subscriptions.GetRecipientsAsync(job.EventType, job.ActorUserId);
                var payload = BuildPayload(job);
                var client = new WebPushClient();
                var vapid = new VapidDetails(_options.Subject, _options.PublicKey, _options.PrivateKey);
                var hasTransientFailure = false;

                foreach (var recipient in recipients)
                {
                    try
                    {
                        await client.SendNotificationAsync(
                            new WebPushSubscription(recipient.Endpoint, recipient.P256dh, recipient.Auth),
                            payload,
                            vapid,
                            cancellationToken);
                    }
                    catch (WebPushException ex) when (ex.StatusCode == HttpStatusCode.NotFound || ex.StatusCode == HttpStatusCode.Gone)
                    {
                        await subscriptions.DeleteByEndpointAsync(recipient.Endpoint);
                    }
                    catch (WebPushException ex)
                    {
                        hasTransientFailure = true;
                        _logger.LogWarning(ex, "Web Push delivery failed for subscription {Endpoint}.", recipient.Endpoint);
                    }
                }

                if (!hasTransientFailure)
                {
                    await jobs.CompleteAsync(job.Id);
                    return;
                }

                await ScheduleRetryAsync(job, jobs, "One or more push notifications could not be delivered.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process push notification job {JobId}.", job.Id);
                await ScheduleRetryAsync(job, jobs, ex.Message);
            }
        }

        private async Task ScheduleRetryAsync(PushNotificationJob job, IPushNotificationJobRepository jobs, string error)
        {
            var attemptCount = job.AttemptCount + 1;
            if (attemptCount >= MaximumAttempts)
            {
                await jobs.FailAsync(job.Id, attemptCount, error);
                return;
            }

            var delay = TimeSpan.FromMinutes(Math.Pow(2, attemptCount - 1));
            await jobs.RetryAsync(job.Id, attemptCount, DateTime.UtcNow.Add(delay), error);
        }

        private static string BuildPayload(PushNotificationJob job)
        {
            var action = job.EventType switch
            {
                PushNotificationEventType.AppointmentCreated when job.AppointmentStartAt == null => "Novi termin na čekanju",
                PushNotificationEventType.AppointmentCreated => "Novi termin",
                PushNotificationEventType.AppointmentUpdated => "Termin je promijenjen",
                PushNotificationEventType.AppointmentDeleted => "Termin je obrisan",
                _ => "Raspored je promijenjen"
            };
            var date = job.AppointmentStartAt?.ToLocalTime().ToString("dd. MM. yyyy. HH:mm", new CultureInfo("hr-HR"));
            var body = "Nova promjena u rasporedu.\r\n" + (string.IsNullOrWhiteSpace(date)
                ? $"{action}: {job.AppointmentTitle}"
                : $"{action}: {job.AppointmentTitle} \r\nPočetak: {date}");

            return JsonSerializer.Serialize(new
            {
                title = "Quintus",
                body,
                tag = $"appointment-{job.AppointmentId}-{job.EventType}",
                url = "/schedule"
            });
        }
    }
}