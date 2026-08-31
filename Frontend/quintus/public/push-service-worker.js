self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Quintus - raspored", {
      body: payload.body || "Raspored je promijenjen.",
      icon: "/favicon.ico",
      tag: payload.tag || "schedule-update",
      data: { url: payload.url || "/schedule" },
      renotify: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/schedule", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => client.url.startsWith(self.location.origin));
      return existing ? existing.focus() : clients.openWindow(targetUrl);
    }),
  );
});