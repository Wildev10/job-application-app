'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Download, Link2 } from 'lucide-react';
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

  const handleStatusUpdated = (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color'>) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === updatedApplication.id
          ? { ...application, status: updatedApplication.status, status_label: updatedApplication.status_label, status_color: updatedApplication.status_color }
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
        confirmButtonColor: '#15803d',
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
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">

          {/* Title + actions row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111827]">Candidatures</h1>
              <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[13px] font-semibold text-[#065F46]">
                {total}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyApplyLink()}
                disabled={!company?.slug}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Link2 size={15} />
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
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#1EB88A] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#0F6E56] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Exporter CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email banner */}
          {showEmailBanner && (
            <div className="rounded-r-[8px] border-l-4 border-l-[#1EB88A] bg-[#F0FDF4] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[13px] leading-relaxed text-[#1A1A2E]">
                  Les candidats reçoivent automatiquement un email de confirmation, puis une notification à chaque changement de statut.
                  <button
                    type="button"
                    onClick={() => void openEmailDetails()}
                    className="ml-2 font-medium text-[#1EB88A] transition hover:text-[#0F6E56]"
                  >
                    En savoir plus
                  </button>
                </p>
                <button
                  type="button"
                  onClick={hideEmailBanner}
                  className="shrink-0 text-[#6B7280] transition hover:text-[#1A1A2E]"
                  aria-label="Masquer la bannière email"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Status filter pills */}
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((filter) => {
              const count = statusCounts[filter.value];
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                    isActive
                      ? 'bg-[#111827] text-white shadow-sm'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {filter.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-[#374151]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role + sort filters */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Rôle</span>
              <div className="flex items-center gap-1.5">
                {[ALL_ROLES_FILTER, ...knownRoles.map((value) => ({ value, label: value }))].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${
                      role === item.value
                        ? 'bg-[#1EB88A] text-white'
                        : 'border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Tri</span>
              {[{ value: 'date', label: 'Date' }, { value: 'score', label: 'Score' }].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSort(item.value)}
                  className={`text-[13px] font-medium transition ${
                    sort === item.value
                      ? 'font-semibold text-[#111827] underline underline-offset-4'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active job filter chip */}
          {selectedJobId && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#2563EB]">
                {selectedJobTitle}
              </span>
              <button
                type="button"
                onClick={clearJobFilter}
                className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-medium text-[#374151] transition hover:border-[#D1D5DB]"
              >
                × Voir tous
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
              <div className="flex gap-4">
                <div className="h-11 w-11 animate-pulse rounded-full bg-[#E5E7EB]" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded-full bg-[#E5E7EB]" />
                  <div className="h-3 w-64 animate-pulse rounded-full bg-[#E5E7EB]" />
                  <div className="h-3 w-48 animate-pulse rounded-full bg-[#E5E7EB]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          {errorMessage}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !errorMessage && filteredApplications.length === 0 && (
        <div className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-2xl">📭</div>
          <p className="text-base font-semibold text-[#111827]">Aucune candidature à afficher.</p>
          <p className="mt-2 text-sm text-[#6B7280]">Affinez les filtres ou revenez plus tard.</p>
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
