const TOKEN_KEY = 'company_token';
const COMPANY_KEY = 'company_data';

/**
 * Save auth token to localStorage and cookie for server-side middleware checks.
 */
export function saveToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax`;
}

/**
 * Read auth token from localStorage.
 */
export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove auth token from localStorage and cookie.
 */
export function removeToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Save company profile in localStorage.
 */
export function saveCompany(company) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
}

/**
 * Read company profile from localStorage.
 */
export function getCompany() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(COMPANY_KEY);

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
 * Remove company profile from localStorage.
 */
export function removeCompany() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(COMPANY_KEY);
}

/**
 * Return true when an auth token is present.
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Clear all local auth data.
 */
export function logout() {
  removeToken();
  removeCompany();
}
