function normalizeBaseUrl(url) {
  const u = String(url || "").trim();
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

// Prefer explicit configuration.
const fromEnv =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "";

// Safe defaults:
// - dev: use HTTP to avoid self-signed HTTPS issues in Node/SSR
// - prod: use the public host
const defaultBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://quintus.fcuric.eu/api"
    : "http://localhost:5113/api";

export const API_BASE_URL = normalizeBaseUrl(fromEnv || defaultBaseUrl);
