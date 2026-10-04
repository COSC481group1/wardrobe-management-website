// Talks to the C# backend. The endpoint paths below are ASSUMED --
// open {apiurl}/swagger (e.g. localhost:PORT/swagger) while the backend is
// running to see the real paths and field names, then edit them here.
// This is the only file that should need changing for that.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const ENDPOINTS = {
  register: "/api/auth/register",
  login: "/api/auth/login",
};

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
//   fetch(`${API_BASE}/api/closet`, { headers: authHeader() })
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong. Please try again.");
  }
  return data;
}

// Email + password only -- the team settled on this over email+username+password.
export function registerUser({ email, password }) {
  return post(ENDPOINTS.register, { email, password });
}

export async function loginUser({ email, password }) {
  const data = await post(ENDPOINTS.login, { email, password });
  if (!data.token) {
    throw new Error("Login worked but the server sent no token.");
  }
  setToken(data.token);
  return data;
}
