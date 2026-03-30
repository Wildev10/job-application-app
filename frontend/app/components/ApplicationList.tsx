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
    <section className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <header className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Administration des candidatures</h1>
            <p className="text-sm text-slate-600">Total: {total} candidature(s)</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Retour au formulaire
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="role-filter" className="mb-1 block text-sm font-semibold text-slate-700">
              Filtrer par rôle
            </label>
            <select
              id="role-filter"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Tous</option>
              <option value="dev">Dev</option>
              <option value="designer">Designer</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="mb-1 block text-sm font-semibold text-slate-700">
              Trier par
            </label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="date">Date décroissante</option>
              <option value="score">Score décroissant</option>
            </select>
          </div>
        </div>
      </header>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Chargement des candidatures...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      {!isLoading && !errorMessage && applications.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Aucune candidature pour le moment.
        </div>
      )}

      {!isLoading && !errorMessage && applications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </section>
  );
}
