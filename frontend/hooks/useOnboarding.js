'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const DEFAULT_STATUS = {
  is_new: false,
  has_jobs: false,
  has_applications: false,
  jobs_count: 0,
  applications_count: 0,
  open_jobs_count: 0,
  pending_applications_count: 0,
};

/**
 * Load onboarding status for the authenticated company.
 */
export function useOnboarding() {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);

      try {
        const payload = await apiFetch('/company/onboarding-status', { method: 'GET' });
        setStatus({
          is_new: Boolean(payload?.is_new),
          has_jobs: Boolean(payload?.has_jobs),
          has_applications: Boolean(payload?.has_applications),
          jobs_count: Number(payload?.jobs_count || 0),
          applications_count: Number(payload?.applications_count || 0),
          open_jobs_count: Number(payload?.open_jobs_count || 0),
          pending_applications_count: Number(payload?.pending_applications_count || 0),
        });
      } catch (error) {
        console.error('Failed to load onboarding status:', error);
        setStatus(DEFAULT_STATUS);
      } finally {
        setLoading(false);
      }
    };

    void loadStatus();
  }, []);

  return {
    status,
    loading,
  };
}
