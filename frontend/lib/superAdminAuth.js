const SUPER_ADMIN_TOKEN_KEY = 'sa_token';
const SUPER_ADMIN_DATA_KEY = 'sa_data';

/**
 * Save super admin token in localStorage and mirrored cookie for middleware checks.
 */
export function saveSuperAdminToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token);
  document.cookie = `${SUPER_ADMIN_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax`;
}

/**
 * Read super admin token from localStorage.
 */
export function getSuperAdminToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
}

/**
 * Remove super admin token from localStorage and cookie.
 */
export function removeSuperAdminToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
  document.cookie = `${SUPER_ADMIN_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Save super admin profile payload in localStorage.
 */
export function saveSuperAdmin(data) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(SUPER_ADMIN_DATA_KEY, JSON.stringify(data));
}

/**
 * Read and parse super admin profile from localStorage.
 */
export function getSuperAdmin() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(SUPER_ADMIN_DATA_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Remove super admin profile from localStorage.
 */
export function removeSuperAdmin() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(SUPER_ADMIN_DATA_KEY);
}

/**
 * Return true when a super admin token exists locally.
 */
export function isSuperAdminAuthenticated() {
  return Boolean(getSuperAdminToken());
}

/**
 * Clear all super admin auth data.
 */
export function superAdminLogout() {
  removeSuperAdminToken();
  removeSuperAdmin();
}
