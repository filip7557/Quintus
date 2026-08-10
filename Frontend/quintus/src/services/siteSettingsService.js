import { API_BASE_URL } from "@/lib/apiBaseUrl";

function normalizeBaseUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildFallbackBaseUrls(baseUrl) {
  const candidates = [
    normalizeBaseUrl(baseUrl),
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
    normalizeBaseUrl(process.env.API_BASE_URL),
  ];

  if (process.env.NODE_ENV !== "production") {
    candidates.push("http://localhost:5113/api", "http://127.0.0.1:5113/api");
  }

  // Heuristic dev fallback for ASP.NET templates:
  // https://<host>:7xxx -> http://<host>:5xxx (or same port)
  for (const candidate of candidates) {
    const m = String(candidate || "").match(/^https:\/\/([^/:]+):(\d+)(\/api)?$/i);
    if (!m) continue;

    const host = m[1];
    const port = Number(m[2]);
    candidates.push(`http://${host}:${port}/api`);
    if (Number.isFinite(port) && port > 2000) {
      candidates.push(`http://${host}:${port - 2000}/api`);
    }
  }

  return Array.from(new Set(candidates.map(normalizeBaseUrl).filter(Boolean)));
}

function normalizeEnumerable(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray(value.$values)) {
    return value.$values;
  }
  return value;
}

function unwrapSettingsPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;

  const directCandidates = [
    payload,
    payload.data,
    payload.Data,
    payload.result,
    payload.Result,
    payload.siteSettings,
    payload.SiteSettings,
  ].filter(Boolean);

  let settings = directCandidates.find(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  );

  if (!settings) {
    const asArray = normalizeEnumerable(payload);
    settings = Array.isArray(asArray) ? asArray[0] : payload;
  }

  if (!settings || typeof settings !== "object") return settings;

  return {
    ...settings,
    Services: normalizeEnumerable(settings.Services),
    services: normalizeEnumerable(settings.services),
  };
}

export async function getSiteSettings() {
  const bases = buildFallbackBaseUrls(API_BASE_URL);
  const routes = ["/SiteSettings", "/siteSettings"];
  let lastError = null;

  for (const base of bases) {
    for (const route of routes) {
      const url = `${base}${route}`;
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status} from ${url}`);
          continue;
        }

        const payload = await response.json();
        return unwrapSettingsPayload(payload);
      } catch (error) {
        lastError = error;
      }
    }
  }

  // Keep rendering resilient
  if (process.env.NODE_ENV !== "production" && lastError) {
    console.warn("[siteSettingsService] Failed to fetch site settings", lastError);
  }

  return null;
}
