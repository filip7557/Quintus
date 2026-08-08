import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const isDev = process.env.NODE_ENV !== "production";

function logRefreshEvent(message, meta) {
  if (!isDev) return;
  // Debug logging disabled
}

let isRefreshing = false;
let refreshSubscribers = [];

function notifyRefreshSubscribers(newToken, refreshError = null) {
  refreshSubscribers.forEach((callback) => callback(newToken, refreshError));
  refreshSubscribers = [];
}

function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Endpoints that should skip refresh
const SKIP_REFRESH_ENDPOINTS = [
  "/auth/getcurrentuser",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh",
];

function shouldSkipRefresh(pathname) {
  const normalized = String(pathname || "").toLowerCase();
  return SKIP_REFRESH_ENDPOINTS.some(
    (endpoint) => normalized === endpoint || normalized.endsWith(endpoint)
  );
}

// Attach token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest) return Promise.reject(error);

    const requestUrl = originalRequest.url || "";

    // Normalize URL to pathname
    const requestPath = new URL(requestUrl, api.defaults.baseURL).pathname;

    // Skip refresh for endpoints in skip list or if not a 401 error
    if (shouldSkipRefresh(requestPath) || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      logRefreshEvent("Request queued while refresh is in progress", {
        requestPath,
        queueSize: refreshSubscribers.length + 1,
      });
      return new Promise((resolve, reject) => {
        addSubscriber((newToken, refreshError) => {
          if (refreshError || !newToken) {
            reject(refreshError || new Error("Token refresh failed"));
            return;
          }

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    logRefreshEvent("Attempting token refresh", { requestPath });

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await axios.post(
        `${api.defaults.baseURL}/Auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = response?.data?.accessToken || response?.data?.AccessToken;
      const newRefreshToken = response?.data?.refreshToken || response?.data?.RefreshToken;
      if (!newAccessToken) throw new Error("Refresh response missing access token");

      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      logRefreshEvent("Token refresh succeeded", {
        requestPath,
        rotatedRefreshToken: Boolean(newRefreshToken),
      });

      notifyRefreshSubscribers(newAccessToken, null);

      return api(originalRequest);
    } catch (refreshError) {
      logRefreshEvent("Token refresh failed", {
        requestPath,
        status: refreshError?.response?.status,
        message: refreshError?.message,
      });
      notifyRefreshSubscribers(null, refreshError);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
