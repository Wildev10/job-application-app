'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/lib/sweetalert';
import JobCard from '@/components/jobs/JobCard';
import JobFormModal from '@/components/jobs/JobFormModal';
import PlanLimitBar from '@/components/PlanLimitBar';
import UpgradeModal from '@/components/UpgradeModal';
import { useJobs } from '@/hooks/useJobs';
import { Plus } from 'lucide-react';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { getCompany } from '@/lib/auth';

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouverts' },
  { value: 'closed', label: 'Fermés' },
];

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

  const company = getCompany();

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
    if (filter === 'all') {
      return jobs;
    }

    return jobs.filter((job) => job.status === filter);
  }, [jobs, filter]);

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

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#0E0E10]">Postes ouverts</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F2600C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D44F08] hover:shadow-md"
        >
          <Plus size={17} strokeWidth={2.5} />
          Nouveau poste
        </button>
      </header>

      {!planLoading && isStarter && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-sm">
          <PlanLimitBar label="Postes actifs" current={planLimits?.jobs?.current || 0} limit={planLimits?.jobs?.limit || 2} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count = item.value === 'all'
            ? jobs.length
            : jobs.filter((j) => j.status === item.value).length;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                filter === item.value
                  ? 'bg-[#0E0E10] text-white shadow-sm'
                  : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#EBEBEB]'
              }`}
            >
              {item.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                filter === item.value ? 'bg-white/20 text-white' : 'bg-white text-[#374151]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="h-5 w-24 animate-pulse rounded-full bg-[#F0F0F0]" />
              <div className="mt-4 h-7 w-3/4 animate-pulse rounded-full bg-[#F0F0F0]" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-[#F0F0F0]" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-[#F0F0F0]" />
              <div className="mt-6 h-9 w-full animate-pulse rounded-full bg-[#F0F0F0]" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!loading && !error && visibleJobs.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4EE] text-2xl">💼</div>
          <p className="text-base font-semibold text-[#0E0E10]">Aucun poste créé.</p>
          <p className="mt-2 text-sm text-[#6B7280]">Créez votre premier poste pour commencer à recevoir des candidatures.</p>
        </div>
      )}

      {!loading && !error && visibleJobs.length > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => openEditModal(job)}
              onClose={() => void handleCloseJob(job)}
              onViewApplications={() => router.push(`/admin/candidatures?job_id=${job.id}`)}
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
