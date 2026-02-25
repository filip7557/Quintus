import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Endpoints that should skip refresh
const SKIP_REFRESH_ENDPOINTS = [
  "/Auth/getCurrentUser",
  "/Auth/login",
  "/Auth/register",
  "/Auth/logout",
];

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
    const originalRequest = error.config;
    const requestUrl = originalRequest.url || "";

    // Normalize URL to pathname
    const requestPath = new URL(requestUrl, api.defaults.baseURL).pathname;

    // Skip refresh for endpoints in skip list or if not a 401 error
    if (
      SKIP_REFRESH_ENDPOINTS.includes(requestPath) ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addSubscriber((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await axios.post(
        `${api.defaults.baseURL}/Auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      onTokenRefreshed(newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token failed:", refreshError);
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
