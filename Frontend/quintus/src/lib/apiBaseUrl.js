function normalizeBaseUrl(url) {
  const u = String(url || "").trim();
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

const PRODUCTION_API_BASE_URL = "https://www.instalacije-quintus.hr/api";

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

function getProductionBaseUrl() {
  return PRODUCTION_API_BASE_URL;
}

// Prefer explicit configuration.
const fromEnv =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "";

// Safe defaults:
// - dev: use HTTP to avoid self-signed HTTPS issues in Node/SSR
// - prod: use the public host matching the current site domain
const defaultBaseUrl =
  process.env.NODE_ENV === "production"
    ? getProductionBaseUrl()
    : getDevBrowserBaseUrl();

export const API_BASE_URL = normalizeBaseUrl(
  process.env.NODE_ENV === "production" ? PRODUCTION_API_BASE_URL : fromEnv || defaultBaseUrl
);
