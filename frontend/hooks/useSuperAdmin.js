'use client';

import { useCallback, useEffect, useState } from 'react';
import { saFetch } from '@/lib/superAdminApi';
import { getSuperAdmin } from '@/lib/superAdminAuth';

/**
 * Manage super admin profile and dashboard statistics state.
 */
export function useSuperAdmin() {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshStats = useCallback(async () => {
    const response = await saFetch('/superadmin/stats', { method: 'GET' });
    setStats(response);
    return response;
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setSuperAdmin(getSuperAdmin());

      try {
        await refreshStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [refreshStats]);

  return {
    superAdmin,
    stats,
    loading,
    error,
    refreshStats,
  };
}
