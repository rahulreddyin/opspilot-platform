const TOKEN_KEY = "opspilot_token";
const USER_KEY = "opspilot_user";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized));
  } catch {
    return {};
  }
}

function normalizeRoles(authResponse, token) {
  const tokenPayload = token ? decodeJwtPayload(token) : {};

  const possibleRoles =
    authResponse?.roles ||
    authResponse?.authorities ||
    tokenPayload?.roles ||
    tokenPayload?.authorities ||
    tokenPayload?.scope ||
    authResponse?.role ||
    tokenPayload?.role ||
    [];

  const rolesArray = Array.isArray(possibleRoles)
    ? possibleRoles
    : String(possibleRoles).split(" ");

  return rolesArray
    .filter(Boolean)
    .map((role) => String(role).replace("ROLE_", "").toUpperCase());
}

export function saveAuth(authResponse) {
  const token =
    authResponse?.token ||
    authResponse?.accessToken ||
    authResponse?.jwt ||
    authResponse?.bearerToken;

  if (!token) {
    throw new Error("Login succeeded, but no token was returned by backend.");
  }

  const roles = normalizeRoles(authResponse, token);

  localStorage.setItem(TOKEN_KEY, token);

  const user = {
    id: authResponse?.id || authResponse?.userId || null,
    name: authResponse?.name || authResponse?.userName || "",
    email: authResponse?.email || "",
    roles,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function getCurrentUserRoles() {
  const user = getCurrentUser();
  const token = getToken();

  const storedRoles = Array.isArray(user?.roles) ? user.roles : [];
  const tokenRoles = normalizeRoles({}, token);

  return [...new Set([...storedRoles, ...tokenRoles])];
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function hasRole(role) {
  return getCurrentUserRoles().includes(String(role).toUpperCase());
}

export function isAdmin() {
  return hasRole("ADMIN");
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}