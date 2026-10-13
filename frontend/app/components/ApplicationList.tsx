'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, ArrowLeft, Briefcase, ChevronDown, Download, Inbox, KanbanSquare, LayoutList, Link2, Lock, Mail, Search, SearchX, X } from 'lucide-react';
import KanbanBoard from '@/app/components/KanbanBoard';
import { Alert } from '@/lib/sweetalert';
import ApplicationCard, { APPLICATION_GRID_COLUMNS } from '@/app/components/ApplicationCard';
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

const SORT_OPTIONS = [
  { value: 'date', label: 'Récentes' },
  { value: 'score', label: 'Meilleur score' },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showArchived, setShowArchived] = useState(false);
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
        if (showArchived) {
          query.set('archived', '1');
        } else {
          if (role) query.set('role', role);
          if (sort) query.set('sort', sort);
          if (selectedJobId) query.set('job_id', selectedJobId);
        }

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
  }, [role, sort, selectedJobId, showArchived]);

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

  const searchFilter = (a: Application) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      a.nom?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q)
    );
  };

  const filteredApplications = useMemo(() => {
    const byStatus = statusFilter === 'all' ? applications : applications.filter((a) => a.status === statusFilter);
    return byStatus.filter(searchFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, statusFilter, searchQuery]);

  const kanbanApplications = useMemo(
    () => applications.filter(searchFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applications, searchQuery],
  );

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

  const effectiveView = showArchived ? 'list' : viewMode;
  const exportLocked = isStarter && !canExportCSV;
  const hasActiveRefinement = Boolean(searchQuery.trim()) || statusFilter !== 'all';

  const toggleArchived = () => {
    setShowArchived((prev) => !prev);
    setSearchQuery('');
    setStatusFilter('all');
  };

  const resetRefinements = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Recrutement</p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-[#0E0E10]">
            {showArchived ? 'Candidatures archivées' : 'Candidatures'}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#6B7280]">
            {isLoading ? (
              <span className="inline-block h-3.5 w-48 animate-pulse rounded-full bg-[#ECECEC] align-middle" />
            ) : showArchived ? (
              <>{total} candidature{total > 1 ? 's' : ''} archivée{total > 1 ? 's' : ''} automatiquement après 30 jours</>
            ) : (
              <>
                {total} candidature{total > 1 ? 's' : ''}
                {statusCounts.pending > 0 && (
                  <>
                    {' · '}
                    <span className="font-semibold text-[#F2600C]">
                      {statusCounts.pending} en attente de réponse
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showArchived && (
            <div className="flex items-center rounded-lg border border-[#E5E5E5] bg-white p-0.5 shadow-sm" role="group" aria-label="Mode d'affichage">
              {([
                { value: 'list', label: 'Liste', icon: LayoutList },
                { value: 'kanban', label: 'Kanban', icon: KanbanSquare },
              ] as const).map((item) => {
                const Icon = item.icon;
                const active = viewMode === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setViewMode(item.value)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition ${
                      active ? 'bg-[#0E0E10] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#0E0E10]'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => void copyApplyLink()}
            disabled={!company?.slug}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3.5 text-[13px] font-semibold text-[#374151] shadow-sm transition hover:border-[#D1D5DB] hover:text-[#0E0E10] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Link2 size={14} />
            Copier mon lien
          </button>

          <button
            type="button"
            onClick={() => {
              if (exportLocked) {
                setIsUpgradeModalOpen(true);
                return;
              }
              setIsExportModalOpen(true);
            }}
            disabled={isExporting}
            title={exportLocked ? 'Fonctionnalité du plan Pro' : undefined}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2600C] px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-[#F2600C]/20 transition hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exportation…
              </>
            ) : (
              <>
                {exportLocked ? <Lock size={13} /> : <Download size={14} />}
                Exporter CSV
              </>
            )}
          </button>
        </div>
      </header>

      {/* Email info banner */}
      {showEmailBanner && !showArchived && (
        <div className="flex items-center gap-3 rounded-xl border border-[#FFE1D1] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4EE] text-[#F2600C]">
            <Mail size={15} />
          </div>
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-[#374151]">
            <span className="font-semibold text-[#0E0E10]">Emails automatiques activés.</span>{' '}
            Chaque candidat reçoit une confirmation, puis une notification à chaque changement de statut.{' '}
            <button
              type="button"
              onClick={() => void openEmailDetails()}
              className="font-semibold text-[#F2600C] underline-offset-2 transition hover:text-[#D44F08] hover:underline"
            >
              En savoir plus
            </button>
          </p>
          <button
            type="button"
            onClick={hideEmailBanner}
            className="shrink-0 rounded-md p-1.5 text-[#9CA3AF] transition hover:bg-[#F5F5F5] hover:text-[#0E0E10]"
            aria-label="Masquer le message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-sm">
        {effectiveView === 'list' && !showArchived && (
          <div className="border-b border-[#F0F0F0] px-2 sm:px-3">
            <div className="-mb-px flex flex-nowrap overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Filtrer par statut">
              {STATUS_FILTERS.map((filter) => {
                const count = statusCounts[filter.value];
                const isActive = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3.5 text-[13px] font-semibold transition ${
                      isActive
                        ? 'border-[#F2600C] text-[#0E0E10]'
                        : 'border-transparent text-[#6B7280] hover:border-[#E5E5E5] hover:text-[#0E0E10]'
                    }`}
                  >
                    {filter.label}
                    <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold leading-none tabular-nums ${
                      isActive ? 'bg-[#F2600C] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-3.5">
          <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un nom, un email ou un poste…"
              aria-label="Rechercher une candidature"
              className="h-9 w-full rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] pl-9 pr-8 text-[13px] text-[#0E0E10] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F2600C] focus:bg-white focus:ring-2 focus:ring-[#F2600C]/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#9CA3AF] hover:text-[#0E0E10]"
                aria-label="Effacer la recherche"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {effectiveView === 'list' && !showArchived && (
              <>
                <div className="relative">
                  <Briefcase size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    aria-label="Filtrer par rôle"
                    className={`h-9 cursor-pointer appearance-none rounded-lg border bg-white pl-8 pr-8 text-[13px] font-medium outline-none transition focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/15 ${
                      role ? 'border-[#F2600C]/40 text-[#0E0E10]' : 'border-[#E5E5E5] text-[#374151] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <option value="">Tous les rôles</option>
                    {knownRoles.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                </div>

                <div className="flex h-9 items-center rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-0.5" role="group" aria-label="Trier">
                  {SORT_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSort(item.value)}
                      aria-pressed={sort === item.value}
                      className={`h-full rounded-md px-3 text-[12.5px] font-semibold transition ${
                        sort === item.value ? 'bg-white text-[#0E0E10] shadow-sm ring-1 ring-black/5' : 'text-[#6B7280] hover:text-[#0E0E10]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={toggleArchived}
              aria-pressed={showArchived}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-semibold transition ${
                showArchived
                  ? 'border-[#0E0E10] bg-[#0E0E10] text-white hover:bg-[#26262A]'
                  : 'border-[#E5E5E5] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#0E0E10]'
              }`}
            >
              {showArchived ? <ArrowLeft size={14} /> : <Archive size={14} />}
              {showArchived ? 'Retour aux actives' : 'Archivées'}
            </button>
          </div>
        </div>

        {selectedJobId && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#F0F0F0] px-3.5 py-2.5">
            <span className="text-[12px] font-medium text-[#9CA3AF]">Filtré sur le poste</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD5C2] bg-[#FFF4EE] py-0.5 pl-2.5 pr-1 text-[12px] font-semibold text-[#C2410C]">
              <Briefcase size={12} />
              {selectedJobTitle || '…'}
              <button
                type="button"
                onClick={clearJobFilter}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[#F2600C]/70 transition hover:bg-[#FFD5C2] hover:text-[#C2410C]"
                aria-label="Retirer le filtre de poste"
              >
                <X size={11} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm">
          <div className="hidden h-10 border-b border-[#F0F0F0] bg-[#FAFAFA] lg:block" />
          <div className="divide-y divide-[#F0F0F0]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#F0F0F0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded-full bg-[#F0F0F0]" />
                  <div className="h-3 w-56 animate-pulse rounded-full bg-[#F5F5F5]" />
                </div>
                <div className="hidden h-3.5 w-36 animate-pulse rounded-full bg-[#F0F0F0] md:block" />
                <div className="h-7 w-28 animate-pulse rounded-full bg-[#F0F0F0]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-medium text-[#991B1B]">
          {errorMessage}
        </div>
      )}

      {/* Kanban board */}
      {!isLoading && !errorMessage && effectiveView === 'kanban' && (
        <KanbanBoard applications={kanbanApplications} onStatusUpdated={handleStatusUpdated} />
      )}

      {/* Empty state */}
      {!isLoading && !errorMessage && effectiveView === 'list' && filteredApplications.length === 0 && (
        <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EE] ring-8 ring-[#FFF4EE]/50">
            {hasActiveRefinement ? (
              <SearchX size={24} className="text-[#F2600C]" strokeWidth={1.75} />
            ) : showArchived ? (
              <Archive size={24} className="text-[#F2600C]" strokeWidth={1.75} />
            ) : (
              <Inbox size={24} className="text-[#F2600C]" strokeWidth={1.75} />
            )}
          </div>
          <p className="mt-5 text-[15px] font-bold text-[#0E0E10]">
            {hasActiveRefinement
              ? 'Aucun résultat'
              : showArchived
                ? 'Aucune candidature archivée'
                : 'Aucune candidature pour le moment'}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#6B7280]">
            {hasActiveRefinement
              ? searchQuery.trim()
                ? `Aucune candidature ne correspond à « ${searchQuery.trim()} » avec les filtres actuels.`
                : 'Aucune candidature pour ce statut.'
              : showArchived
                ? 'Les candidatures traitées depuis plus de 30 jours apparaîtront ici.'
                : 'Partagez votre lien de candidature pour commencer à recevoir des profils.'}
          </p>
          {hasActiveRefinement ? (
            <button
              type="button"
              onClick={resetRefinements}
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-4 text-[13px] font-semibold text-[#374151] transition hover:border-[#D1D5DB] hover:text-[#0E0E10]"
            >
              Réinitialiser les filtres
            </button>
          ) : !showArchived && company?.slug ? (
            <button
              type="button"
              onClick={() => void copyApplyLink()}
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2600C] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#D44F08]"
            >
              <Link2 size={14} />
              Copier mon lien de candidature
            </button>
          ) : null}
        </div>
      )}

      {/* List */}
      {!isLoading && !errorMessage && effectiveView === 'list' && filteredApplications.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm">
          <div
            className={`hidden gap-5 border-b border-[#F0F0F0] bg-[#FAFAFA] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] lg:grid ${APPLICATION_GRID_COLUMNS}`}
          >
            <span>Candidat</span>
            <span>Poste</span>
            <span>Score</span>
            <span>Statut</span>
            <span>Reçue</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} onStatusUpdated={handleStatusUpdated} />
            ))}
          </div>
          <div className="border-t border-[#F0F0F0] bg-[#FAFAFA] px-5 py-2.5 text-[12px] text-[#9CA3AF]">
            {filteredApplications.length === applications.length
              ? `${applications.length} candidature${applications.length > 1 ? 's' : ''}`
              : `${filteredApplications.length} sur ${applications.length} candidatures`}
          </div>
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
