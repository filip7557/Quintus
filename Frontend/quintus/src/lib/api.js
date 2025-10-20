import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7295/api",
  withCredentials: true // if using cookies
});

// Store tokens in memory or localStorage
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Request interceptor: attach token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if it's already retried or not a 401
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait for refresh to finish
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
      // Call refresh endpoint
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("https://localhost:7295/api/Auth/refresh", {
        refreshToken
      });

      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      onTokenRefreshed(newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token failed:", refreshError);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Redirect to login or handle logout
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
