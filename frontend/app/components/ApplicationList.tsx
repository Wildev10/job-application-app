'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ApplicationCard from '@/app/components/ApplicationCard';
import { getApplications } from '@/app/lib/api';
import type { ApiError, Application, ApplicationStatus } from '@/app/types/application';

type StatusFilter = 'all' | ApplicationStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewing', label: 'En cours d\'examen' },
  { value: 'interview', label: 'Entretien prévu' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
];

/**
 * Load and render applications list with role and sort filters.
 */
export default function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('date');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getApplications({
          role: role || undefined,
          sort,
        });

        setApplications(response.data);
        setTotal(response.total);
      } catch (error) {
        const apiError = error as ApiError;
        setErrorMessage(apiError.message || 'Impossible de charger les candidatures.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [role, sort]);

  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((application) => application.status === 'pending').length,
      reviewing: applications.filter((application) => application.status === 'reviewing').length,
      interview: applications.filter((application) => application.status === 'interview').length,
      accepted: applications.filter((application) => application.status === 'accepted').length,
      rejected: applications.filter((application) => application.status === 'rejected').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') {
      return applications;
    }

    return applications.filter((application) => application.status === statusFilter);
  }, [applications, statusFilter]);

  /**
   * Apply status update in local state to avoid refetching the whole list.
   */
  const handleStatusUpdated = (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color'>) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === updatedApplication.id
          ? {
              ...application,
              status: updatedApplication.status,
              status_label: updatedApplication.status_label,
              status_color: updatedApplication.status_color,
            }
          : application,
      ),
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-10">
      <header className="space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Tableau de suivi</p>
            <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-5xl">
              Candidatures
            </h1>
          </div>

          <div className="flex items-end justify-between gap-6 sm:justify-end">
            <p className="text-5xl font-extrabold leading-none tracking-[-0.03em] text-[#0f0f0f] sm:text-6xl">
              {total}
            </p>
            <p className="pb-1 text-sm text-[#737373]">profils</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-y border-[#e5e5e5] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <p className="font-medium text-[#737373]">Rôle</p>
            <button
              type="button"
              onClick={() => setRole('')}
              className={`border-b pb-0.5 font-medium ${
                role === '' ? 'border-[#0f0f0f] text-[#0f0f0f]' : 'border-transparent text-[#737373] hover:text-[#0f0f0f]'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setRole('dev')}
              className={`border-b pb-0.5 font-medium ${
                role === 'dev' ? 'border-[#0f0f0f] text-[#0f0f0f]' : 'border-transparent text-[#737373] hover:text-[#0f0f0f]'
              }`}
            >
              Dev
            </button>
            <button
              type="button"
              onClick={() => setRole('designer')}
              className={`border-b pb-0.5 font-medium ${
                role === 'designer'
                  ? 'border-[#0f0f0f] text-[#0f0f0f]'
                  : 'border-transparent text-[#737373] hover:text-[#0f0f0f]'
              }`}
            >
              Designer
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm">
            <p className="font-medium text-[#737373]">Tri</p>
            <button
              type="button"
              onClick={() => setSort('date')}
              className={`border-b pb-0.5 font-medium ${
                sort === 'date' ? 'border-[#0f0f0f] text-[#0f0f0f]' : 'border-transparent text-[#737373] hover:text-[#0f0f0f]'
              }`}
            >
              Date
            </button>
            <button
              type="button"
              onClick={() => setSort('score')}
              className={`border-b pb-0.5 font-medium ${
                sort === 'score' ? 'border-[#0f0f0f] text-[#0f0f0f]' : 'border-transparent text-[#737373] hover:text-[#0f0f0f]'
              }`}
            >
              Score
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e5e5] pb-4">
          {STATUS_FILTERS.map((filter) => {
            const count = statusCounts[filter.value];
            const isActive = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#0f0f0f] text-white'
                    : 'bg-[#f5f5f4] text-[#44403c] hover:bg-[#e7e5e4]'
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>

        <Link href="/" className="inline-block text-sm font-medium text-[#525252] hover:text-[#0f0f0f]">
          Retour au formulaire
        </Link>
      </header>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 border-b border-[#e5e5e5] py-5">
              <div className="h-4 w-44 animate-pulse bg-[#f0f0f0]" />
              <div className="h-3 w-72 animate-pulse bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="border-l-2 border-red-600 py-2 pl-3 text-sm text-red-700">{errorMessage}</div>
      )}

      {!isLoading && !errorMessage && filteredApplications.length === 0 && (
        <div className="border-b border-[#e5e5e5] py-10 text-sm text-[#737373]">
          Il n&apos;y a pas de donnée pour le moment.
        </div>
      )}

      {!isLoading && !errorMessage && filteredApplications.length > 0 && (
        <div className="divide-y divide-[#e5e5e5]">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onStatusUpdated={handleStatusUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}
