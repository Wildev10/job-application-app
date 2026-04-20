'use client';

import { useCallback, useState } from 'react';
import { saFetch } from '@/lib/superAdminApi';

/**
 * Manage super admin companies listing, details and actions.
 */
export function useSuperAdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCompanies = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });

      const endpoint = `/superadmin/companies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await saFetch(endpoint, { method: 'GET' });

      const rows = Array.isArray(response?.data) ? response.data : [];
      setCompanies(rows);
      setPagination({
        currentPage: response?.current_page || 1,
        lastPage: response?.last_page || 1,
        total: response?.total || rows.length,
        perPage: response?.per_page || rows.length,
      });

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les entreprises.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyById = useCallback(async (id) => {
    return saFetch(`/superadmin/companies/${id}`, { method: 'GET' });
  }, []);

  const suspendCompany = useCallback(async (id) => {
    return saFetch(`/superadmin/companies/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  }, []);

  const activateCompany = useCallback(async (id) => {
    return saFetch(`/superadmin/companies/${id}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  }, []);

  const impersonateCompany = useCallback(async (id) => {
    return saFetch(`/superadmin/companies/${id}/impersonate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }, []);

  return {
    companies,
    pagination,
    loading,
    error,
    fetchCompanies,
    fetchCompanyById,
    suspendCompany,
    activateCompany,
    impersonateCompany,
  };
}
