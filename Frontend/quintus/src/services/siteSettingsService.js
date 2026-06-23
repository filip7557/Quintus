import { API_BASE_URL } from "@/lib/apiBaseUrl";

function buildFallbackBaseUrls(baseUrl) {
  const url = String(baseUrl || "").trim();
  const candidates = [url];

  // Heuristic dev fallback for ASP.NET templates:
  // https://localhost:7xxx -> http://localhost:5xxx (or same port)
  const m = url.match(/^https:\/\/localhost:(\d+)(\/api)?$/i);
  if (m) {
    const port = Number(m[1]);
    candidates.push(`http://localhost:${port}/api`);
    if (Number.isFinite(port) && port > 2000) {
      candidates.push(`http://localhost:${port - 2000}/api`);
    }
  }

  return Array.from(new Set(candidates)).filter(Boolean);
}

export async function getSiteSettings() {
  const bases = buildFallbackBaseUrls(API_BASE_URL);
  let lastError = null;

  for (const base of bases) {
    const url = `${base}/SiteSettings`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} from ${url}`);
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  // Keep rendering resilient

  return null;
}
