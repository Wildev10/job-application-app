const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured.');
}

/**
 * Unified API helper with base URL, optional Bearer token and JSON parsing.
 */
export async function apiFetch(endpoint, options = {}) {
  const { headers = {}, body, ...rest } = options;
  const normalizedHeaders = new Headers(headers);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('company_token');
    if (token) {
      normalizedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && !normalizedHeaders.has('Content-Type')) {
    normalizedHeaders.set('Content-Type', 'application/json');
  }

  if (!normalizedHeaders.has('Accept')) {
    normalizedHeaders.set('Accept', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: normalizedHeaders,
    body,
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
