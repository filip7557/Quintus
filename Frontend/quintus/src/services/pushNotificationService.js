import api from "@/lib/api";

const SERVICE_WORKER_PATH = "/push-service-worker.js";

export function isPushNotificationSupported() {
  return typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
}

function base64UrlToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

function subscriptionPayload(subscription) {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
  };
}

export async function getPushRegistration() {
  return navigator.serviceWorker.register(SERVICE_WORKER_PATH);
}

export async function getBrowserPushSubscription() {
  const registration = await getPushRegistration();
  return registration.pushManager.getSubscription();
}

export async function createBrowserPushSubscription(publicKey) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("Dopuštenje za obavijesti nije odobreno.");

  const registration = await getPushRegistration();
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription)
    return existingSubscription;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(publicKey),
  });
}

export async function getPushConfig() {
  try {
    return await api.get("/push-notifications/config");
  } catch (error) {
    return error.response;
  }
}

export async function getPushPreferences(endpoint) {
  try {
    return await api.get("/push-notifications/subscription", { params: { endpoint } });
  } catch (error) {
    return error.response;
  }
}

export async function savePushSubscription(subscription, preferences) {
  try {
    return await api.post("/push-notifications/subscription", {
      ...subscriptionPayload(subscription),
      ...preferences,
    });
  } catch (error) {
    return error.response;
  }
}

export async function updatePushPreferences(endpoint, preferences) {
  try {
    return await api.put("/push-notifications/subscription/preferences", {
      endpoint,
      ...preferences,
    });
  } catch (error) {
    return error.response;
  }
}

export async function removePushSubscription(endpoint) {
  try {
    return await api.delete("/push-notifications/subscription", { params: { endpoint } });
  } catch (error) {
    return error.response;
  }
}