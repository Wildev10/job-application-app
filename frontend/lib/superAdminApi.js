import { getSuperAdminToken } from '@/lib/superAdminAuth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/backend-api').replace(/\/$/, '');

/**
 * Perform an authenticated super admin request and return parsed JSON.
 */
export async function saFetch(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const headers = new Headers(options.headers || {});

  const token = getSuperAdminToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && typeof payload.message === 'string'
      ? payload.message
      : 'Une erreur est survenue.';
    throw new Error(message);
  }

  return payload;
}
