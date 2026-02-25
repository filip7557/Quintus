import api from "@/lib/api";

let cachedToken = undefined;
let cachedCurrentUserResponse = undefined; // axios response or null
let inFlightCurrentUserPromise = null;

function getAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const token = getAccessToken();

  // No token => no user; also acts as cache.
  if (!token) {
    cachedToken = token;
    cachedCurrentUserResponse = null;
    inFlightCurrentUserPromise = null;
    return null;
  }

  // Cache hit.
  if (cachedToken === token && cachedCurrentUserResponse !== undefined) {
    return cachedCurrentUserResponse;
  }

  // Join in-flight for the same token.
  if (cachedToken === token && inFlightCurrentUserPromise) {
    return inFlightCurrentUserPromise;
  }

  // Token changed: reset and fetch.
  cachedToken = token;
  cachedCurrentUserResponse = undefined;

  inFlightCurrentUserPromise = api
    .get("/Auth/getCurrentUser", {
      // Treat "not logged in" as a normal outcome to avoid console noise.
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 401 || status === 403,
    })
    .then((response) => {
      const ok = response?.status >= 200 && response?.status < 300;
      const value = ok ? response : null;

      // Only commit if token didn't change mid-flight.
      if (cachedToken === getAccessToken()) {
        cachedCurrentUserResponse = value;
      }

      return value;
    })
    .catch((error) => {
      if (cachedToken === getAccessToken()) {
        cachedCurrentUserResponse = null;
      }
      return null;
    })
    .finally(() => {
      inFlightCurrentUserPromise = null;
    });

  return inFlightCurrentUserPromise;
}

export async function login(email, password) {
  try {
  const response = await api.post("/Auth/login", { email, password });
  const { accessToken, refreshToken } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  // Invalidate cached user on login.
  cachedToken = accessToken;
  cachedCurrentUserResponse = undefined;
  inFlightCurrentUserPromise = null;

  return response;
  } catch (error) {
    return error.response;
  } 
}

export async function register(data) {
  try {
  const response = await api.post("/Auth/register", data);
  return response;
  } catch (error) {
    return error.response;
  }
}

export async function verifyEmail(params) {
  try {
    const response = await api.get("/Auth/verify-email", { params });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function resendVerification(email) {
  try {
    const response = await api.post("/Auth/resend-verification", { email });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function forgotPassword(email) {
  try {
    const response = await api.post("/Auth/forgot-password", { email });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await api.post("/Auth/reset-password", {
      token,
      newPassword,
    });
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function logout() {
  await api.post("/Auth/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Invalidate cached user on logout.
  cachedToken = null;
  cachedCurrentUserResponse = null;
  inFlightCurrentUserPromise = null;
}