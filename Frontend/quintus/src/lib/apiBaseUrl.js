function normalizeBaseUrl(url) {
  const u = String(url || "").trim();
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

function isLoopbackHost(hostname) {
  const h = String(hostname || "").trim().toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function getDevBrowserBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5113/api";
  }

  const { hostname } = window.location || {};
  if (!hostname || isLoopbackHost(hostname)) {
    return "http://localhost:5113/api";
  }

  return `http://${hostname}:5113/api`;
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
    : getDevBrowserBaseUrl();

export const API_BASE_URL = normalizeBaseUrl(fromEnv || defaultBaseUrl);
