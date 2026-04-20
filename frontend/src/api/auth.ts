import axios from "axios";

const API_BASE = 'http://localhost:8000';
//process.env.REACT_APP_API_URL || 

export const ACCESS_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

/** `user_id` from JWT payload (djangorestframework-simplejwt). */
export function getCurrentUserIdFromToken(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { user_id?: unknown };
    const uid = payload.user_id;
    if (uid == null) return null;
    const n = Number(uid);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function login(username: string, password: string) {
  const res = await axios.post(`${API_BASE}/api/auth/login/`, {
    username,
    password,
  });
  setTokens(res.data.access, res.data.refresh);
  return res.data;
}

export async function signup(
  username: string,
  email: string,
  password: string
) {
  return axios.post(`${API_BASE}/api/auth/signup/`, {
    username,
    email,
    password,
  });
}
export async function logout() {
  const refresh = getRefreshToken();

  try {
    if (refresh) {
      await axios.post("http://127.0.0.1:8000/api/auth/logout/", {
        refresh,
      });
    }
  } finally {
    clearTokens();
  }
}