import type {
  Application,
  ApplicationStatus,
  ApplicationsResponse,
  UpdateStatusResponse,
} from '@/app/types/application';
import { apiFetch } from '@/lib/api';

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
 * Submit an application as multipart/form-data.
 */
export async function submitApplication(formData: FormData): Promise<Application> {
  return (await apiFetch('/applications', {
    method: 'POST',
    body: formData,
  })) as Application;
}

/**
 * Fetch applications list with optional filter and sort.
 */
export async function getApplications(params?: {
  role?: string;
  sort?: string;
}): Promise<ApplicationsResponse> {
  return (await apiFetch(`/applications${buildQuery(params)}`, {
    method: 'GET',
    cache: 'no-store',
  })) as ApplicationsResponse;
}

/**
 * Update one application status from the admin interface.
 */
export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
): Promise<UpdateStatusResponse> {
  return (await apiFetch(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })) as UpdateStatusResponse;
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
