'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ApplicationCard from '@/app/components/ApplicationCard';
import { getApplications } from '@/app/lib/api';
import type { ApiError, Application } from '@/app/types/application';

/**
 * Load and render applications list with role and sort filters.
 */
export default function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('date');
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

      {!isLoading && !errorMessage && applications.length === 0 && (
        <div className="border-b border-[#e5e5e5] py-10 text-sm text-[#737373]">
          Il n&apos;y a pas de donnée pour le moment.
        </div>
      )}

      {!isLoading && !errorMessage && applications.length > 0 && (
        <div className="divide-y divide-[#e5e5e5]">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </section>
  );
}
