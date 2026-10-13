'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, CalendarClock, ExternalLink, Inbox, Plus, Search, SearchX, TrendingUp, X } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import JobCard from '@/components/jobs/JobCard';
import JobFormModal from '@/components/jobs/JobFormModal';
import UpgradeModal from '@/components/UpgradeModal';
import { useJobs } from '@/hooks/useJobs';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { getCompany } from '@/lib/auth';
import { daysFromToday } from '@/lib/date';

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouverts' },
  { value: 'closed', label: 'Clôturés' },
];

function subscribeToStorage(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function readCompanyRaw() {
  return localStorage.getItem('company_data');
}

function MetricTile({ icon: Icon, label, value, hint, hintTone = 'text-[#9CA3AF]', loading }) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#6B7280]">
        <Icon size={14} className="text-[#9CA3AF]" />
        {label}
      </div>
      {loading ? (
        <div className="mt-2.5 h-7 w-12 animate-pulse rounded-lg bg-[#F0F0F0]" />
      ) : (
        <p className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-[#0E0E10] tabular-nums">{value}</p>
      )}
      <p className={`mt-1.5 truncate text-[12px] ${hintTone}`}>{hint}</p>
    </div>
  );
}

/**
 * Render the admin jobs management page with create/edit/close actions.
 */
export default function AdminPostesPage() {
  const router = useRouter();
  const { jobs, loading, error, createJob, updateJob, closeJob } = useJobs();
  const {
    planLimits,
    loading: planLoading,
    isStarter,
    jobsRemaining,
    refreshPlanLimits,
  } = usePlanStatus();
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const companyRaw = useSyncExternalStore(subscribeToStorage, readCompanyRaw, () => null);
  const company = useMemo(() => (companyRaw ? getCompany() : null), [companyRaw]);

  useEffect(() => {
    if (!error) {
      return;
    }

    void Alert.fire({
      icon: 'error',
      title: 'Chargement impossible',
      text: error,
      confirmButtonColor: '#dc2626',
    });
  }, [error]);

  const visibleJobs = useMemo(() => {
    const byStatus = filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((job) =>
      [job.title, job.role, job.location].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [jobs, filter, searchQuery]);

  const metrics = useMemo(() => {
    const open = jobs.filter((job) => job.status === 'open');
    const totalApplications = jobs.reduce((sum, job) => sum + Number(job.applications_count || 0), 0);
    const openApplications = open.reduce((sum, job) => sum + Number(job.applications_count || 0), 0);
    const expiringSoon = open.filter((job) => {
      const days = daysFromToday(job.expires_at);
      return days !== null && days >= 0 && days <= 7;
    }).length;

    return {
      open: open.length,
      closed: jobs.length - open.length,
      totalApplications,
      average: open.length > 0 ? Math.round((openApplications / open.length) * 10) / 10 : 0,
      expiringSoon,
    };
  }, [jobs]);

  const copyJobLink = async (job) => {
    if (!company?.slug || !job.slug) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    await navigator.clipboard.writeText(`${appUrl}/apply/${company.slug}/${job.slug}`);
    await Alert.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Lien du poste copié',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const openCreateModal = () => {
    if (isStarter && Number(jobsRemaining || 0) <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setEditingJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editingJob) {
      const result = await updateJob(editingJob.id, data);

      if (!result.success) {
        await Alert.fire({
          icon: 'error',
          title: 'Échec de la modification',
          text: result.message || 'Impossible de modifier ce poste.',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      setIsModalOpen(false);
      setEditingJob(null);

      await Alert.fire({
        icon: 'success',
        title: 'Poste mis à jour',
        text: 'Les informations du poste ont été sauvegardées.',
        confirmButtonColor: '#F2600C',
      });

      return;
    }

    const result = await createJob(data);

    if (!result.success) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de la création',
        text: result.message || 'Impossible de créer ce poste.',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    setIsModalOpen(false);

    await refreshPlanLimits();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const publicLink = company?.slug
      ? `${appUrl}/apply/${company.slug}/${result.job.slug}`
      : `${appUrl}/apply/{companySlug}/${result.job.slug}`;

    await Alert.fire({
      icon: 'success',
      title: 'Poste créé !',
      html: `<p>Partagez ce lien :</p><p style="margin-top:8px;word-break:break-all;font-weight:600;">${publicLink}</p>`,
      confirmButtonColor: '#F2600C',
    });
  };

  const handleCloseJob = async (job) => {
    const confirmation = await Alert.fire({
      title: 'Êtes-vous sûr de vouloir clôturer ce poste ?',
      text: 'Les candidatures existantes seront conservées.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, clôturer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    const result = await closeJob(job.id);

    if (!result.success) {
      await Alert.fire({
        icon: 'error',
        title: 'Clôture impossible',
        text: result.message || 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    await Alert.fire({
      icon: 'success',
      title: 'Poste clôturé',
      text: 'Le poste a été clôturé avec succès.',
      confirmButtonColor: '#F2600C',
    });
  };

  const jobsLimit = Number(planLimits?.jobs?.limit || 2);
  const jobsCurrent = Number(planLimits?.jobs?.current || 0);
  const jobsPct = Math.min(100, Math.round((jobsCurrent / jobsLimit) * 100));
  const jobsBarTone = jobsPct >= 100 ? 'bg-red-500' : jobsPct >= 75 ? 'bg-amber-400' : 'bg-[#F2600C]';
  const hasRefinement = filter !== 'all' || Boolean(searchQuery.trim());

  return (
    <section className="space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Recrutement</p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-[#0E0E10]">Postes</h1>
          <p className="mt-1 text-[13.5px] text-[#6B7280]">
            Publiez vos offres et suivez les candidatures reçues pour chacune.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {company?.slug && (
            <Link
              href={`/careers/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3.5 text-[13px] font-semibold text-[#374151] shadow-sm transition hover:border-[#D1D5DB] hover:text-[#0E0E10]"
            >
              <ExternalLink size={14} />
              Page carrières
            </Link>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2600C] px-4 text-[13px] font-semibold text-white shadow-sm shadow-[#F2600C]/20 transition hover:bg-[#D44F08]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Nouveau poste
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm">
        <div className="grid grid-cols-2 gap-px bg-[#F0F0F0] lg:grid-cols-4">
          <MetricTile
            icon={BriefcaseBusiness}
            label="Postes ouverts"
            value={metrics.open}
            hint={`${jobs.length} publié${jobs.length > 1 ? 's' : ''} au total`}
            loading={loading}
          />
          <MetricTile
            icon={Inbox}
            label="Candidatures"
            value={metrics.totalApplications}
            hint="Tous postes confondus"
            loading={loading}
          />
          <MetricTile
            icon={TrendingUp}
            label="Moyenne par poste"
            value={metrics.average.toLocaleString('fr-FR')}
            hint="Sur les postes ouverts"
            loading={loading}
          />
          <MetricTile
            icon={CalendarClock}
            label="Expirent sous 7 j"
            value={metrics.expiringSoon}
            hint={metrics.expiringSoon > 0 ? 'À prolonger ou clôturer' : 'Aucune échéance proche'}
            hintTone={metrics.expiringSoon > 0 ? 'font-medium text-amber-700' : 'text-[#9CA3AF]'}
            loading={loading}
          />
        </div>

        {!planLoading && isStarter && (
          <div className="flex flex-col gap-3 border-t border-[#F0F0F0] bg-[#FAFAFA] px-5 py-3 sm:flex-row sm:items-center">
            <p className="shrink-0 text-[12.5px] text-[#6B7280]">
              <span className="font-semibold text-[#0E0E10]">Plan Starter</span> · {jobsCurrent} / {jobsLimit} postes actifs
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8E8E8] sm:max-w-xs">
              <div className={`h-full rounded-full transition-all duration-500 ${jobsBarTone}`} style={{ width: `${jobsPct}%` }} />
            </div>
            <Link
              href="/admin/upgrade"
              className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[#F2600C] transition hover:text-[#D44F08] sm:ml-auto"
            >
              {jobsPct >= 100 ? 'Limite atteinte — passer au Pro' : 'Postes illimités avec Pro'}
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {(loading || jobs.length > 0) && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-9 w-fit items-center rounded-lg border border-[#E5E5E5] bg-white p-0.5 shadow-sm" role="group" aria-label="Filtrer par statut">
            {FILTERS.map((item) => {
              const count = item.value === 'all' ? jobs.length : item.value === 'open' ? metrics.open : metrics.closed;
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={active}
                  className={`inline-flex h-full items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition ${
                    active ? 'bg-[#0E0E10] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#0E0E10]'
                  }`}
                >
                  {item.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold leading-none tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un poste…"
              aria-label="Rechercher un poste"
              className="h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pl-9 pr-8 text-[13px] text-[#0E0E10] shadow-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/15 [&::-webkit-search-cancel-button]:hidden"
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
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm">
              <div className="flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-[#F0F0F0]" />
                <div className="h-5 w-12 animate-pulse rounded-full bg-[#F5F5F5]" />
              </div>
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded-full bg-[#F0F0F0]" />
              <div className="mt-3 h-3.5 w-1/2 animate-pulse rounded-full bg-[#F5F5F5]" />
              <div className="mt-6 h-14 w-full animate-pulse rounded-xl bg-[#F5F5F5]" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!loading && !error && visibleJobs.length === 0 && (
        <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EE] ring-8 ring-[#FFF4EE]/50">
            {hasRefinement && jobs.length > 0
              ? <SearchX size={24} className="text-[#F2600C]" strokeWidth={1.75} />
              : <BriefcaseBusiness size={24} className="text-[#F2600C]" strokeWidth={1.75} />}
          </div>
          {hasRefinement && jobs.length > 0 ? (
            <>
              <p className="mt-5 text-[15px] font-bold text-[#0E0E10]">Aucun poste trouvé</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#6B7280]">
                Aucun poste ne correspond à vos filtres actuels.
              </p>
              <button
                type="button"
                onClick={() => { setFilter('all'); setSearchQuery(''); }}
                className="mt-5 inline-flex h-9 items-center rounded-lg border border-[#E5E5E5] bg-white px-4 text-[13px] font-semibold text-[#374151] transition hover:border-[#D1D5DB] hover:text-[#0E0E10]"
              >
                Réinitialiser les filtres
              </button>
            </>
          ) : (
            <>
              <p className="mt-5 text-[15px] font-bold text-[#0E0E10]">Publiez votre premier poste</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#6B7280]">
                Chaque poste dispose de son propre lien de candidature à partager sur vos réseaux.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F2600C] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#D44F08]"
              >
                <Plus size={15} strokeWidth={2.5} />
                Créer un poste
              </button>
            </>
          )}
        </div>
      )}

      {!loading && !error && visibleJobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => openEditModal(job)}
              onClose={() => void handleCloseJob(job)}
              onCopyLink={() => void copyJobLink(job)}
              onViewApplications={() => router.push(`/admin/postes/${job.id}`)}
            />
          ))}
        </div>
      )}

      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingJob}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="limite_jobs"
      />
    </section>
  );
}
