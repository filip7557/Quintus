using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Quintus.Common;
using Quintus.Model.Entities;
using Quintus.Repository.Common;
using Quintus.Worker;
using System.Security.Claims;

namespace Quintus.WebAPI.Controllers
{
    [Route("api/push-notifications")]
    [ApiController]
    [Authorize(Roles = "Admin,Owner,Worker")]
    public class PushNotificationController : ControllerBase
    {
        private readonly IPushSubscriptionRepository _subscriptions;
        private readonly PushNotificationOptions _options;

        public PushNotificationController(IPushSubscriptionRepository subscriptions, IOptions<PushNotificationOptions> options)
        {
            _subscriptions = subscriptions;
            _options = options.Value;
        }

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            if (!_options.IsConfigured)
                return StatusCode(StatusCodes.Status503ServiceUnavailable, "Web Push nije konfiguriran.");

            return Ok(new PushNotificationConfigResponse { PublicKey = _options.PublicKey });
        }

        [HttpGet("subscription")]
        public async Task<IActionResult> GetSubscription([FromQuery] string endpoint)
        {
            var subscription = await _subscriptions.GetForUserAsync(CurrentUserId(), endpoint);
            return subscription == null ? NotFound() : Ok(ToResponse(subscription));
        }

        [HttpPost("subscription")]
        public async Task<IActionResult> UpsertSubscription([FromBody] PushSubscriptionRequest request)
        {
            try
            {
                var subscription = await _subscriptions.UpsertAsync(new PushSubscription
                {
                    Id = Guid.NewGuid(),
                    UserId = CurrentUserId(),
                    Endpoint = request.Endpoint,
                    P256dh = request.P256dh,
                    Auth = request.Auth,
                    NotifyOnAppointmentCreated = request.NotifyOnAppointmentCreated,
                    NotifyOnAppointmentUpdated = request.NotifyOnAppointmentUpdated,
                    NotifyOnAppointmentDeleted = request.NotifyOnAppointmentDeleted
                });

                return Ok(ToResponse(subscription));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("subscription/preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] PushNotificationPreferencesRequest request)
        {
            var updated = await _subscriptions.UpdatePreferencesAsync(
                CurrentUserId(),
                request.Endpoint,
                request.NotifyOnAppointmentCreated,
                request.NotifyOnAppointmentUpdated,
                request.NotifyOnAppointmentDeleted);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("subscription")]
        public async Task<IActionResult> DeleteSubscription([FromQuery] string endpoint)
        {
            var deleted = await _subscriptions.DeleteAsync(CurrentUserId(), endpoint);
            return deleted ? NoContent() : NotFound();
        }

        private Guid CurrentUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        private static PushNotificationPreferencesResponse ToResponse(PushSubscription subscription)
        {
            return new PushNotificationPreferencesResponse
            {
                Endpoint = subscription.Endpoint,
                NotifyOnAppointmentCreated = subscription.NotifyOnAppointmentCreated,
                NotifyOnAppointmentUpdated = subscription.NotifyOnAppointmentUpdated,
                NotifyOnAppointmentDeleted = subscription.NotifyOnAppointmentDeleted
            };
        }
    }
}