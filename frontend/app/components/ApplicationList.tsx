'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpDown, Download, Inbox, Link2, X } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import ApplicationCard from '@/app/components/ApplicationCard';
import ExportModal from '@/app/components/ExportModal';
import UpgradeModal from '@/components/UpgradeModal';
import type { ApiError, Application, ApplicationStatus } from '@/app/types/application';
import { apiFetch, exportCSV } from '@/lib/api';
import { getCompany } from '@/lib/auth';
import { usePlanStatus } from '@/hooks/usePlanStatus';

type StatusFilter = 'all' | ApplicationStatus;
type ExportFilters = {
  status?: string;
  role?: string;
  date_from?: string;
  date_to?: string;
};

type CompanyProfile = {
  id?: number;
  name?: string;
  logo?: string | null;
  slug?: string;
};

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewing', label: 'En examen' },
  { value: 'interview', label: 'Entretien' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
];

const ALL_ROLES_FILTER = { value: '', label: 'Tous les rôles' };

const EMAIL_BANNER_STORAGE_KEY = 'hide_email_banner';

/**
 * Load and render applications list with role and sort filters.
 */
export default function ApplicationList({
  initialJobId = null,
  initialStatusFilter = 'all',
}: {
  initialJobId?: string | null;
  initialStatusFilter?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('');
  const [knownRoles, setKnownRoles] = useState<string[]>([]);
  const [sort, setSort] = useState('date');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const { canExportCSV, isStarter } = usePlanStatus();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  useEffect(() => {
    setCompany(getCompany());
    const shouldHideBanner = localStorage.getItem(EMAIL_BANNER_STORAGE_KEY) === 'true';
    setShowEmailBanner(!shouldHideBanner);
  }, []);

  useEffect(() => {
    setSelectedJobId(initialJobId);
  }, [initialJobId]);

  useEffect(() => {
    if (STATUS_FILTERS.some((filter) => filter.value === initialStatusFilter)) {
      setStatusFilter(initialStatusFilter as StatusFilter);
    }
  }, [initialStatusFilter]);

  const copyApplyLink = async () => {
    if (!company?.slug) {
      return;
    }
    const link = `${appUrl}/apply/${company.slug}`;
    await navigator.clipboard.writeText(link);
    await Alert.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Lien copié !',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const openEmailDetails = async () => {
    await Alert.fire({
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
            <li>Email personnalisé selon le statut</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Compris',
      confirmButtonColor: '#F2600C',
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
        if (role) query.set('role', role);
        if (sort) query.set('sort', sort);
        if (selectedJobId) query.set('job_id', selectedJobId);

        const response = await apiFetch(`/applications?${query.toString()}`, { method: 'GET' });
        setApplications(response.data);
        // Keep every role seen so far so the filter does not shrink once applied.
        setKnownRoles((previous) => Array.from(new Set([
          ...previous,
          ...response.data.map((item: Application) => item.role).filter(Boolean),
        ])).sort((a, b) => a.localeCompare(b)));
        setTotal(response.total);

        if (selectedJobId) {
          const jobsResponse = await apiFetch('/jobs', { method: 'GET' });
          const currentJob = Array.isArray(jobsResponse?.data)
            ? jobsResponse.data.find((job: { id: number; title: string }) => String(job.id) === selectedJobId)
            : null;

          if (currentJob?.title) {
            setSelectedJobTitle(currentJob.title);
          } else if (response.data.length > 0 && response.data[0].job_title) {
            setSelectedJobTitle(response.data[0].job_title);
          } else {
            setSelectedJobTitle('Poste filtré');
          }
        } else {
          setSelectedJobTitle('');
        }
      } catch (error) {
        const apiError = error as ApiError;
        setErrorMessage(apiError.message || 'Impossible de charger les candidatures.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [role, sort, selectedJobId]);

  const clearJobFilter = () => {
    setSelectedJobId(null);
    setSelectedJobTitle('');
    router.push(pathname);
  };

  const statusCounts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  const handleStatusUpdated = (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color' | 'interview_date' | 'interview_location'>) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === updatedApplication.id
          ? { ...application, ...updatedApplication }
          : application,
      ),
    );
  };

  const handleExport = async (filters: ExportFilters) => {
    setIsExportModalOpen(false);
    setIsExporting(true);

    void Alert.fire({
      title: 'Export en cours...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => { Alert.showLoading(); },
    });

    try {
      await exportCSV(filters);
      Alert.close();
      await Alert.fire({
        title: 'Export réussi !',
        text: 'Votre fichier CSV a été téléchargé.',
        icon: 'success',
        confirmButtonColor: '#F2600C',
      });
    } catch (error) {
      const apiError = error as ApiError;
      Alert.close();
      await Alert.fire({
        icon: 'error',
        title: 'Export impossible',
        text: apiError.message || "Une erreur est survenue pendant l'export du fichier.",
        confirmButtonColor: '#DC2626',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-7xl space-y-4"
      style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">

        {/* Top row: title + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-[#0E0E10]">Candidatures</h1>
            {total > 0 && (
              <span className="rounded-full bg-[#FFF4EE] px-2.5 py-0.5 text-[13px] font-bold text-[#F2600C]">
                {total}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void copyApplyLink()}
              disabled={!company?.slug}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-2 text-[13px] font-medium text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Link2 size={14} />
              Copier mon lien
            </button>

            <button
              type="button"
              onClick={() => {
                if (isStarter && !canExportCSV) {
                  setIsUpgradeModalOpen(true);
                  return;
                }
                setIsExportModalOpen(true);
              }}
              disabled={isExporting}
              title={isStarter && !canExportCSV ? 'Fonctionnalité Pro' : undefined}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2600C] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Exportation...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Exporter CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email info banner */}
        {showEmailBanner && (
          <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] px-4 py-3 sm:mx-6">
            <p className="flex-1 text-[12.5px] leading-relaxed text-[#0E0E10]">
              <span className="font-semibold">Emails automatiques activés —</span> chaque candidat reçoit une confirmation immédiate, puis une notification à chaque changement de statut.{' '}
              <button
                type="button"
                onClick={() => void openEmailDetails()}
                className="font-semibold text-[#F2600C] transition hover:text-[#D44F08] hover:underline"
              >
                Voir les détails
              </button>
            </p>
            <button
              type="button"
              onClick={hideEmailBanner}
              className="mt-0.5 shrink-0 rounded p-0.5 text-[#9CA3AF] transition hover:text-[#0E0E10]"
              aria-label="Masquer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Status filter tabs */}
        <div className="border-t border-[#F0F0F0] px-5 sm:px-6">
          <div className="flex flex-nowrap gap-0 overflow-x-auto">
            {STATUS_FILTERS.map((filter) => {
              const count = statusCounts[filter.value];
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-3.5 text-[13px] font-medium transition ${
                    isActive
                      ? 'text-[#F2600C]'
                      : 'text-[#6B7280] hover:text-[#0E0E10]'
                  }`}
                >
                  {filter.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isActive
                      ? 'bg-[#FFF4EE] text-[#F2600C]'
                      : 'bg-[#F0F0F0] text-[#9CA3AF]'
                  }`}>
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[#F2600C]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role + sort filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] bg-[#FAFAFA] px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">Rôle</span>
            {[ALL_ROLES_FILTER, ...knownRoles.map((value) => ({ value, label: value }))].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value)}
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition ${
                  role === item.value
                    ? 'bg-[#F2600C] text-white shadow-sm'
                    : 'border border-[#E5E5E5] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#0E0E10]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white p-0.5">
            <ArrowUpDown size={12} className="ml-2 text-[#9CA3AF]" />
            {[{ value: 'date', label: 'Date' }, { value: 'score', label: 'Score' }].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSort(item.value)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                  sort === item.value
                    ? 'bg-[#0E0E10] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0E0E10]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active job filter chip */}
        {selectedJobId && (
          <div className="flex items-center gap-2 border-t border-[#F0F0F0] bg-[#FAFAFA] px-5 py-2.5 sm:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Poste</span>
            <div className="flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] pl-3 pr-1.5 py-0.5">
              <span className="text-[12px] font-semibold text-[#2563EB]">{selectedJobTitle}</span>
              <button
                type="button"
                onClick={clearJobFilter}
                className="flex h-4 w-4 items-center justify-center rounded-full text-[#93C5FD] transition hover:bg-[#BFDBFE] hover:text-[#1D4ED8]"
                aria-label="Supprimer le filtre"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex gap-4">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#F0F0F0]" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-[#F0F0F0]" />
                  <div className="h-3 w-64 animate-pulse rounded-full bg-[#F0F0F0]" />
                  <div className="h-3 w-36 animate-pulse rounded-full bg-[#F0F0F0]" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-[#F0F0F0]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-medium text-[#991B1B]">
          {errorMessage}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !errorMessage && filteredApplications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4EE]">
            <Inbox size={28} className="text-[#F2600C]" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-bold text-[#0E0E10]">Aucune candidature</p>
          <p className="mt-1.5 text-[13px] text-[#9CA3AF]">
            {statusFilter !== 'all'
              ? 'Aucune candidature pour ce statut. Essayez un autre filtre.'
              : 'Partagez votre lien de candidature pour commencer à recevoir des profils.'}
          </p>
          {statusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:border-[#D1D5DB] hover:text-[#0E0E10]"
            >
              Voir toutes les candidatures
            </button>
          )}
        </div>
      )}

      {/* Application cards */}
      {!isLoading && !errorMessage && filteredApplications.length > 0 && (
        <div className="space-y-3">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} onStatusUpdated={handleStatusUpdated} />
          ))}
        </div>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(filters: ExportFilters) => void handleExport(filters)}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="export_csv"
      />
    </section>
  );
}
