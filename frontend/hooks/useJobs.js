'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Manage jobs CRUD state for the admin jobs page.
 */
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFetch('/jobs', { method: 'GET' });
        setJobs(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les postes.');
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, []);

  const createJob = async (data) => {
    try {
      const job = await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setJobs((previous) => [job, ...previous]);
      setError(null);

      return { success: true, job };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Impossible de créer le poste.',
      };
    }
  };

  const updateJob = async (id, data) => {
    try {
      const job = await apiFetch(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      setJobs((previous) => previous.map((item) => (item.id === id ? { ...item, ...job } : item)));
      setError(null);

      return { success: true, job };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Impossible de modifier le poste.',
      };
    }
  };

  const closeJob = async (id) => {
    try {
      await apiFetch(`/jobs/${id}`, {
        method: 'DELETE',
      });

      setJobs((previous) => previous.map((item) => (
        item.id === id
          ? { ...item, status: 'closed', status_label: 'Fermé' }
          : item
      )));
      setError(null);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Impossible de clôturer le poste.',
      };
    }
  };

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    closeJob,
  };
}
