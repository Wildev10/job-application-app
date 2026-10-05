'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Archive,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  MapPin,
  PencilLine,
} from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import ApplicationList from '@/app/components/ApplicationList';
import JobFormModal from '@/components/jobs/JobFormModal';

const STATUS_CONFIG = {
  open:   { badge: 'bg-[#FFF4EE] text-[#F2600C]', dot: 'bg-[#F2600C]', label: 'Ouvert' },
  closed: { badge: 'bg-[#F5F5F5] text-[#6B7280]', dot: 'bg-[#9CA3AF]', label: 'Fermé' },
  draft:  { badge: 'bg-amber-50 text-amber-700',   dot: 'bg-[#FFD43B]', label: 'Brouillon' },
};

export default function PosteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/jobs/${id}`, { method: 'GET' });
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Poste introuvable.');
      } finally {
        setLoading(false);
      }
    };
    if (id) void loadJob();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      const updated = await apiFetch(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setJob((prev) => ({ ...prev, ...updated }));
      setIsEditModalOpen(false);
      await Alert.fire({
        icon: 'success',
        title: 'Poste mis à jour',
        confirmButtonColor: '#F2600C',
      });
    } catch (err) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de la modification',
        text: err instanceof Error ? err.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleClose = async () => {
    const { isConfirmed } = await Alert.fire({
      title: 'Clôturer ce poste ?',
      text: 'Les candidatures existantes seront conservées.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, clôturer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });
    if (!isConfirmed) return;

    try {
      await apiFetch(`/jobs/${id}`, { method: 'DELETE' });
      setJob((prev) => ({ ...prev, status: 'closed', status_label: 'Fermé' }));
      await Alert.fire({
        icon: 'success',
        title: 'Poste clôturé',
        confirmButtonColor: '#F2600C',
      });
    } catch (err) {
      await Alert.fire({
        icon: 'error',
        title: 'Clôture impossible',
        text: err instanceof Error ? err.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-full bg-[#F0F0F0]" />
        <div className="h-28 animate-pulse rounded-xl bg-[#F0F0F0]" />
        <div className="h-64 animate-pulse rounded-xl bg-[#F0F0F0]" />
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="space-y-5">
        <button
          type="button"
          onClick={() => router.push('/admin/postes')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#0E0E10]"
        >
          <ArrowLeft size={16} />
          Retour aux postes
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error || 'Poste introuvable.'}
        </div>
      </section>
    );
  }

  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
  const expiresAt = job.expires_at ? new Date(job.expires_at) : null;
  const now = new Date();
  const isExpiringSoon = expiresAt
    ? expiresAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000 && expiresAt.getTime() > now.getTime()
    : false;

  return (
    <section className="space-y-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push('/admin/postes')}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#0E0E10]"
      >
        <ArrowLeft size={16} />
        Retour aux postes
      </button>

      {/* Job header card */}
      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
        <div className={`h-1 w-full ${job.status === 'open' ? 'bg-[#F2600C]' : job.status === 'closed' ? 'bg-[#9CA3AF]' : 'bg-[#FFD43B]'}`} />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#0E0E10]">{job.title}</h1>
              <span className="mt-1 inline-block rounded-md bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
                Réf. #{job.id}
              </span>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${config.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {job.status_label || config.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="my-4 grid grid-cols-1 gap-2 rounded-xl bg-[#FAFAFA] px-4 py-3 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <Briefcase size={14} className="shrink-0 text-[#F2600C]" />
              <span className="text-[12px] text-[#9CA3AF]">Rôle</span>
              <span className="text-[13px] font-medium text-[#0E0E10]">{job.role}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <PencilLine size={14} className="shrink-0 text-[#F2600C]" />
              <span className="text-[12px] text-[#9CA3AF]">Type</span>
              <span className="text-[13px] font-medium text-[#0E0E10]">{job.type_label || job.type}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="shrink-0 text-[#F2600C]" />
              <span className="text-[12px] text-[#9CA3AF]">Lieu</span>
              <span className="text-[13px] font-medium text-[#0E0E10]">{job.location || 'Non précisée'}</span>
            </div>
          </div>

          {expiresAt && (
            <div className={`mb-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium ${
              isExpiringSoon ? 'bg-amber-50 text-amber-700' : 'bg-[#F5F5F5] text-[#6B7280]'
            }`}>
              <CalendarDays size={13} />
              Expire le {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(expiresAt)}
              {isExpiringSoon && ' — bientôt'}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-medium text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
            >
              <PencilLine size={14} />
              Modifier le poste
            </button>
            <button
              type="button"
              onClick={() => void handleClose()}
              disabled={job.status === 'closed'}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[#E5E5E5] disabled:text-[#9CA3AF]"
            >
              <Archive size={14} />
              Clôturer
            </button>
          </div>
        </div>
      </div>

      {/* Candidatures for this job */}
      <ApplicationList initialJobId={String(job.id)} />

      <JobFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={job}
      />
    </section>
  );
}
