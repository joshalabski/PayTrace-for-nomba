const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const TOKEN_KEY = "paytrace_token";
const USER_KEY = "paytrace_user";

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => Boolean(getToken());

export const signup = async (name, email, password) => {
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Signup failed");
  saveSession(data.token, data.user);
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Login failed");
  saveSession(data.token, data.user);
  return data;
};

export const logout = () => {
  clearSession();
};

export const authFetch = (path, options = {}) => {
  const token = getToken();
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

// Fetches the latest name/email for the logged-in user from the backend
// (also refreshes what's cached in localStorage).
export const getMe = async () => {
  const response = await authFetch("/auth/me");
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Could not load profile");
  saveSession(getToken(), data.user);
  return data.user;
};

// Updates name/email and optionally the password. Pass currentPassword +
// newPassword together to change the password.
export const updateProfile = async ({ name, email, currentPassword, newPassword }) => {
  const response = await authFetch("/auth/me", {
    method: "PUT",
    body: JSON.stringify({ name, email, currentPassword, newPassword }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Could not update profile");
  saveSession(data.token, data.user);
  return data.user;
};
