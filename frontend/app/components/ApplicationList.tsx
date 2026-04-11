'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import ApplicationCard from '@/app/components/ApplicationCard';
import type { ApiError, Application, ApplicationStatus } from '@/app/types/application';
import { apiFetch, downloadApiFile } from '@/lib/api';
import { getCompany } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

type StatusFilter = 'all' | ApplicationStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewing', label: 'En cours d\'examen' },
  { value: 'interview', label: 'Entretien prévu' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
];

const EMAIL_BANNER_STORAGE_KEY = 'hide_email_banner';

/**
 * Load and render applications list with role and sort filters.
 */
export default function ApplicationList() {
  const { logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('date');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [company, setCompany] = useState<{ name?: string; logo?: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailBanner, setShowEmailBanner] = useState(false);

  useEffect(() => {
    setCompany(getCompany());

    // Persist user choice to hide the informational email banner.
    const shouldHideBanner = localStorage.getItem(EMAIL_BANNER_STORAGE_KEY) === 'true';
    setShowEmailBanner(!shouldHideBanner);
  }, []);

  const openEmailDetails = async () => {
    await Swal.fire({
      title: 'Emails automatiques',
      html: `
        <div style="text-align:left;line-height:1.6;">
          <p style="margin:0 0 10px;">A la candidature :</p>
          <ul style="margin:0 0 12px 18px;padding:0;">
            <li>Email de confirmation au candidat</li>
            <li>Alerte email au RH</li>
          </ul>
          <p style="margin:0;">Au changement de statut :</p>
          <ul style="margin:8px 0 0 18px;padding:0;">
            <li>Email personnalise selon le statut</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Compris',
      confirmButtonColor: '#4338ca',
      background: '#FAFAF9',
      color: '#0F0F0F',
    });
  };

  const hideEmailBanner = () => {
    localStorage.setItem(EMAIL_BANNER_STORAGE_KEY, 'true');
    setShowEmailBanner(false);
  };

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const query = new URLSearchParams();
        if (role) {
          query.set('role', role);
        }
        if (sort) {
          query.set('sort', sort);
        }

        const response = await apiFetch(`/applications?${query.toString()}`, {
          method: 'GET',
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

  const exportQuery = useMemo(() => {
    const query = new URLSearchParams();

    if (role) {
      query.set('role', role);
    }

    if (statusFilter !== 'all') {
      query.set('status', statusFilter);
    }

    const serialized = query.toString();

    return serialized ? `?${serialized}` : '';
  }, [role, statusFilter]);

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

  /**
   * Ask confirmation before ending the authenticated company session.
   */
  const handleLogout = async () => {
    const confirmation = await Swal.fire({
      title: 'Se déconnecter ? ',
      text: 'Votre session admin sera fermée.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, me déconnecter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    await logout();
  };

  /**
   * Download a CSV export that matches the current admin filters.
   */
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { filename } = await downloadApiFile(`/applications/export${exportQuery}`, {
        method: 'GET',
      });

      await Swal.fire({
        icon: 'success',
        title: 'Export terminé',
        text: `Le fichier ${filename} a été téléchargé.`,
        confirmButtonColor: '#0F0F0F',
      });
    } catch (error) {
      const apiError = error as ApiError;

      await Swal.fire({
        icon: 'error',
        title: 'Export impossible',
        text: apiError.message || 'Une erreur est survenue pendant le téléchargement du CSV.',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-10">
      <header className="space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {company?.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name || 'Company'}
                    width={36}
                    height={36}
                    unoptimized
                    className="h-9 w-9 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f3f4f6] text-xs font-bold text-[#525252]">
                    {company?.name?.slice(0, 1)?.toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Tableau de suivi</p>
                  <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-4xl">
                    {company?.name || 'Espace entreprise'}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-md border border-[#d4d4d4] px-3 py-1.5 text-sm font-medium text-[#44403c] hover:border-[#ef4444] hover:text-[#b91c1c]"
              >
                Se déconnecter
              </button>
            </div>

            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-5xl">
              Candidatures
            </h2>
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

        {showEmailBanner && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm leading-6 text-indigo-900">
                <span className="mr-2">📧</span>
                Les candidats reçoivent automatiquement un email de confirmation à chaque candidature,
                et une notification lors de chaque changement de statut.
              </p>

              <button
                type="button"
                onClick={hideEmailBanner}
                className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                aria-label="Masquer la bannière email"
              >
                x
              </button>
            </div>

            <button
              type="button"
              onClick={() => void openEmailDetails()}
              className="mt-3 text-xs font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
            >
              En savoir plus
            </button>
          </div>
        )}

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

        <div className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0f0f0f]">Exporter les candidatures</p>
            <p className="text-sm text-[#57534e]">
              Le fichier CSV reprend les filtres actifs:
              {' '}
              <span className="font-medium">
                rôle {role || 'tous'}
              </span>
              {' '}et{' '}
              <span className="font-medium">
                statut {statusFilter === 'all' ? 'tous' : STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label?.toLowerCase()}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-lg bg-[#0f0f0f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
          </button>
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
