const TOKEN_KEY = "token";

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getTokenPayload = (token) => {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, "="));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() / 1000 >= payload.exp;
};

export const isValidAdminSession = () => {
  const token = getToken();
  const payload = getTokenPayload(token);
  return Boolean(token && payload?.role === "admin" && !isTokenExpired(token));
};
