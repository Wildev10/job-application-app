const COMPANY_KEY = 'company_data';
const AUTH_FLAG_KEY = 'company_authenticated';

/**
 * Mark the session as authenticated (token lives in an HttpOnly cookie — JS cannot read it).
 */
export function saveToken() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_FLAG_KEY, '1');
}

/**
 * Clear the authentication flag (the server clears the HttpOnly cookie on logout).
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_FLAG_KEY);
}

/**
 * Return a truthy value when the session appears authenticated.
 * The actual token is in an HttpOnly cookie and cannot be read here.
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_FLAG_KEY) || null;
}

/**
 * Save company profile in localStorage.
 */
export function saveCompany(company) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
}

/**
 * Read company profile from localStorage.
 */
export function getCompany() {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(COMPANY_KEY);
  if (!raw) return null;

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
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPANY_KEY);
}

/**
 * Return true when an auth session is active.
 */
export function isAuthenticated() {
  return !!getToken() || !!getCompany();
}

/**
 * Clear all local auth data (the HttpOnly cookie is cleared server-side on logout).
 */
export function logout() {
  removeToken();
  removeCompany();
}
