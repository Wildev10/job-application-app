const PRIMARY_API_URL = (process.env.NEXT_PUBLIC_API_URL || '/backend-api').replace(/\/$/, '');
const PROXY_API_URL = '/backend-api';

function buildUrl(baseUrl, endpoint) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

function isNetworkError(error) {
  return error instanceof TypeError;
}

function shouldRetryWithProxy(error, baseUrl) {
  return isNetworkError(error) && baseUrl !== PROXY_API_URL;
}

async function requestJson(baseUrl, endpoint, options) {
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

  const response = await fetch(buildUrl(baseUrl, endpoint), {
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

/**
 * Unified API helper with base URL, optional Bearer token and JSON parsing.
 */
export async function apiFetch(endpoint, options = {}) {
  try {
    return await requestJson(PRIMARY_API_URL, endpoint, options);
  } catch (error) {
    if (shouldRetryWithProxy(error, PRIMARY_API_URL)) {
      return requestJson(PROXY_API_URL, endpoint, options);
    }

    if (isNetworkError(error)) {
      throw new Error('Connexion au serveur impossible. Verifiez que le backend Laravel est lance et accessible.');
    }

    throw error;
  }
}

/**
 * Export applications as CSV and trigger a browser download.
 */
export async function exportCSV(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.set(key, value);
    }
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('company_token') : null;
  const endpoint = query.toString()
    ? '/applications/export?' + query.toString()
    : '/applications/export';
  const normalizedHeaders = new Headers();

  if (token) {
    normalizedHeaders.set('Authorization', `Bearer ${token}`);
  }

  normalizedHeaders.set('Accept', 'text/csv,application/octet-stream');

  let response;

  try {
    response = await fetch(buildUrl(PRIMARY_API_URL, endpoint), {
      method: 'GET',
      headers: normalizedHeaders,
    });
  } catch (error) {
    if (shouldRetryWithProxy(error, PRIMARY_API_URL)) {
      response = await fetch(buildUrl(PROXY_API_URL, endpoint), {
        method: 'GET',
        headers: normalizedHeaders,
      });
    } else if (isNetworkError(error)) {
      throw new Error('Connexion au serveur impossible. Verifiez que le backend Laravel est lance et accessible.');
    } else {
      throw error;
    }
  }

  if (!response.ok) {
    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const message = payload && typeof payload.message === 'string'
      ? payload.message
      : 'Une erreur est survenue.';
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition') || '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const filename = filenameMatch?.[1] || 'export.csv';
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);

  return {
    filename,
  };
}
