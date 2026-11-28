
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const ENDPOINTS = {
  register: "/User/CreateAccount",
  login: "/User/SignIn",
  refresh: "/User/Refresh",
  logout: "/User/Logout",
};

const TOKEN_COOKIE = "wardrobe_token";
const REFRESH_COOKIE = "wardrobe_refresh";

const ACCESS_TOKEN_SECONDS = 60 * 60;
const REFRESH_TOKEN_SECONDS = 60 * 60 * 24 * 30;

function getCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function getToken() {
  return getCookie(TOKEN_COOKIE);
}

function getRefreshToken() {
  return getCookie(REFRESH_COOKIE);
}

function setCookie(name, value, maxAge) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function setTokens(accessToken, refreshToken) {
  setCookie(TOKEN_COOKIE, accessToken, ACCESS_TOKEN_SECONDS);
  setCookie(REFRESH_COOKIE, refreshToken, REFRESH_TOKEN_SECONDS);
}

export function logout() {
  const refreshToken = getRefreshToken();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (refreshToken) {
    fetch(`${API_BASE}${ENDPOINTS.logout}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
  document.cookie = `${REFRESH_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function isLoggedIn() {
  return Boolean(getToken() || getRefreshToken());
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.refresh}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      if (!data?.token || !data?.refreshToken) return false;

      setTokens(data.token, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function callApi(method, path, {
  query,
  body,
  retry = true,
  responseType = 'json'
} = {}) {
  const queryString = query
    ? `?${new URLSearchParams(query)}`
    : "";

  const url = `${API_BASE}${path}${queryString}`;

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...authHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Bad call: " + url);
  }

  if (response.status === 401 && getRefreshToken() && retry) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return callApi(method, path, { query, body, retry: false });
    }

    logout();
    window.location.reload();
    throw new Error("Your session expired. Please log in again.");
  }

  let data;

  if (responseType === 'blob' && response.ok) {
    return await response.blob();
  }

  const text = await response.text();
  data = text;

  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response.
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.title || data?.error;

    if (response.status >= 500) {
      throw new Error(
        "The server isn't responding. Make sure the backend is running."
      );
    }

    if (message) {
      throw new Error(`${url}: ${message}`);
    }

    throw new Error("Something went wrong. Please try again.");
  }

  if (responseType === 'blob') {
    return response.blob();
  }

  return data;
  }

export function registerUser({ email, password }) {
  return callApi("POST", ENDPOINTS.register, {
    query: { username: email, password },
  });
}

export async function loginUser({ email, password }) {
  const data = await callApi("GET", ENDPOINTS.login, {
    query: [["username", email], ["password", password]],
  });

  if (!data?.token || !data?.refreshToken) {
    throw new Error("Login failed: missing access or refresh token.");
  }

  setTokens(data.token, data.refreshToken);

  return data;
}
