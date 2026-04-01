import type {
  Application,
  ApplicationStatus,
  ApplicationsResponse,
  ApiError,
  UpdateStatusResponse,
} from '@/app/types/application';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured.');
}

const RESOLVED_API_URL = API_URL;

/**
 * Build querystring from optional role/sort filters.
 */
function buildQuery(params?: { role?: string; sort?: string }): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  if (params.role) {
    searchParams.set('role', params.role);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

/**
 * Parse and throw typed API errors using backend JSON payload.
 */
async function throwApiError(response: Response): Promise<never> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const apiError: ApiError = {
    message:
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Une erreur est survenue.',
    status: response.status,
    errors:
      typeof payload === 'object' &&
      payload !== null &&
      'errors' in payload &&
      typeof payload.errors === 'object' &&
      payload.errors !== null
        ? (payload.errors as Record<string, string[]>)
        : undefined,
  };

  throw apiError;
}

/**
 * Submit an application as multipart/form-data.
 */
export async function submitApplication(formData: FormData): Promise<Application> {
  const response = await fetch(`${RESOLVED_API_URL}/applications`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as Application;
}

/**
 * Fetch applications list with optional filter and sort.
 */
export async function getApplications(params?: {
  role?: string;
  sort?: string;
}): Promise<ApplicationsResponse> {
  const response = await fetch(`${RESOLVED_API_URL}/applications${buildQuery(params)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as ApplicationsResponse;
}

/**
 * Update one application status from the admin interface.
 */
export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
): Promise<UpdateStatusResponse> {
  const response = await fetch(`${RESOLVED_API_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as UpdateStatusResponse;
}

/**
 * Resolve stored cv path to a downloadable public URL.
 */
export function getCvPublicUrl(cvPath: string | null): string | null {
  if (!cvPath) {
    return null;
  }

  if (/^https?:\/\//i.test(cvPath)) {
    return cvPath;
  }

  const backendBase = RESOLVED_API_URL.replace(/\/api\/?$/, '');

  return `${backendBase}/storage/${cvPath}`;
}
