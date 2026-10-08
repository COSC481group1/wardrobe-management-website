// Talks to the C# backend (WardrobeBackend).
//
// API_BASE is empty on purpose: requests go to the same origin the page was
// loaded from. During `npm run dev` the Vite proxy (see vite.config.js)
// forwards /User to https://localhost:7163; when the built site is served by
// the backend itself it is already the same origin. When the backend moves to
// AWS, serve the site from there too, or set VITE_API_URL to the new address.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Paths come from the backend controllers -- check {apiurl}/swagger.
export const ENDPOINTS = {
  register: "/User/CreateAccount",
  login: "/api/auth/login", // not wired up yet -- the backend has GET /User/SignIn
};

// Lucas's CreateAccount is a plain GET with query-string parameters. If
// Swagger shows it as POST instead, change this one word.
const REGISTER_METHOD = "GET";

// Per Lucas's plan: login returns a token, the frontend stores it as a
// cookie, then sends it in the Authorization header on later requests
// to the user endpoints.
const TOKEN_COOKIE = "wardrobe_token";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export function getToken() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setToken(token) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${ONE_WEEK_SECONDS}; SameSite=Lax${secure}`;
}

export function logout() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// Attach this to every request to a user endpoint, e.g.
//   fetch(`${API_BASE}/User/Something`, { headers: authHeader() })
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// One place that makes every backend call. `query` becomes the query string
// (URLSearchParams encodes special characters in passwords for us); `body`,
// if given, is sent as JSON. The backend may answer with JSON or plain text,
// so the reply is read as text first.
async function callApi(method, path, { query, body } = {}) {
  const queryString = query ? `?${new URLSearchParams(query)}` : "";

  let response;
  try {
    response = await fetch(`${API_BASE}${path}${queryString}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    /* plain-text or empty reply -- keep the raw text */
  }

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data?.message || data?.title || data?.error;
    if (message) throw new Error(message);
    if (response.status >= 500) {
      throw new Error("The server isn't responding. Make sure the backend is running.");
    }
    throw new Error("Something went wrong. Please try again.");
  }
  return data;
}

// The backend's parameter is called "username"; we send the email there,
// since the team settled on email + password only.
export function registerUser({ email, password }) {
  return callApi(REGISTER_METHOD, ENDPOINTS.register, {
    query: { username: email, password },
  });
}

export async function loginUser({ email, password }) {
  const data = await callApi("POST", ENDPOINTS.login, { body: { email, password } });
  if (!data?.token) {
    throw new Error("Login worked but the server sent no token.");
  }
  setToken(data.token);
  return data;
}
