'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/lib/sweetalert';
import JobCard from '@/components/jobs/JobCard';
import JobFormModal from '@/components/jobs/JobFormModal';
import PlanLimitBar from '@/components/PlanLimitBar';
import UpgradeModal from '@/components/UpgradeModal';
import { useJobs } from '@/hooks/useJobs';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { getCompany } from '@/lib/auth';
// FIX-CONTRAST: lisibilite corrigee

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
        confirmButtonColor: '#0d9488',
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
      confirmButtonColor: '#0d9488',
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
      confirmButtonColor: '#0d9488',
    });
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0f0f0f]">Postes ouverts</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          Nouveau poste
        </button>
      </header>

      {!planLoading && isStarter && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 text-sm text-[#334155]">
          <PlanLimitBar
            label="Postes actifs"
            current={planLimits?.jobs?.current || 0}
            limit={planLimits?.jobs?.limit || 2}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === item.value
                ? 'bg-teal-600 text-white'
                : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="h-5 w-24 animate-pulse rounded bg-[#eef0f3]" />
              <div className="mt-4 h-7 w-3/4 animate-pulse rounded bg-[#eef0f3]" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[#eef0f3]" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#eef0f3]" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-[#eef0f3]" />
              <div className="mt-6 h-9 w-full animate-pulse rounded bg-[#eef0f3]" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && visibleJobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6] text-2xl">💼</div>
          <p className="text-base font-semibold text-[#111827]">Aucun poste créé.</p>
          <p className="mt-2 text-sm text-[#6b7280]">
            Créez votre premier poste pour commencer à recevoir des candidatures.
          </p>
        </div>
      )}

      {!loading && !error && visibleJobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
