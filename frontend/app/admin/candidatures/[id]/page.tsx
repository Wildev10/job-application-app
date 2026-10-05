'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Star,
  User,
} from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import StatusBadge from '@/app/components/StatusBadge';
import StatusSelector from '@/app/components/StatusSelector';
import type { Application } from '@/app/types/application';
import { apiFetch, downloadApplicationCv } from '@/lib/api';

const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Full detail view for a single application.
 */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch(`/applications/${id}`, { method: 'GET' });
        setApplication(data);
      } catch {
        setErrorMessage('Candidature introuvable ou accès refusé.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) void load();
  }, [id]);

  const handleStatusUpdated = (updated: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color' | 'interview_date' | 'interview_location'>) => {
    setApplication((prev) => prev ? { ...prev, ...updated } : prev);
  };

  const handleDownloadCv = async () => {
    try {
      await downloadApplicationCv(id);
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Téléchargement impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#DC2626',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl space-y-5">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[#F0F0F0]" />
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
          <div className="h-36 animate-pulse bg-[#F0F0F0]" />
          <div className="space-y-4 p-6">
            <div className="h-5 w-48 animate-pulse rounded-full bg-[#F0F0F0]" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-[#F0F0F0]" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#F0F0F0]" />
          </div>
        </div>
        <div className="h-40 animate-pulse rounded-2xl border border-[#E5E5E5] bg-white" />
      </section>
    );
  }

  if (errorMessage || !application) {
    return (
      <section className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#0E0E10]"
        >
          <ArrowLeft size={15} />
          Retour
        </button>
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-medium text-[#991B1B]">
          {errorMessage || 'Candidature introuvable.'}
        </div>
      </section>
    );
  }

  const initials = (application.nom || 'C')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'C';

  const avatarColor = getAvatarColor(application.nom || 'C');
  const score = Math.max(0, Math.min(5, application.score || 0));

  const submittedAt = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(application.created_at));

  const scoreLabel = score >= 4 ? 'Excellent' : score >= 3 ? 'Bon' : score >= 2 ? 'Moyen' : 'Faible';
  const scoreClass =
    score >= 4
      ? 'bg-[#FFF4EE] text-[#F2600C] border-[#FFD5C2]'
      : score >= 2
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-600 border-red-200';

  return (
    <section className="mx-auto max-w-3xl space-y-5">

      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push('/admin/candidatures')}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#0E0E10]"
      >
        <ArrowLeft size={15} />
        Toutes les candidatures
      </button>

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
        {/* Dark header strip */}
        <div className="relative bg-[#0E0E10] px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#F2600C]/10 blur-2xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Avatar */}
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[22px] font-bold shadow-sm ${avatarColor.bg} ${avatarColor.text}`}>
              {initials}
            </div>
            {/* Name + role */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-white">{application.nom}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/80">
                  <Briefcase size={12} className="opacity-70" />
                  {application.role}
                </span>
                {application.job_title && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/80">
                    {application.job_title}
                  </span>
                )}
              </div>
            </div>
            {/* Score */}
            <div className={`shrink-0 rounded-xl border px-4 py-2 text-center ${scoreClass}`}>
              <div className="flex items-center justify-center gap-1">
                <Star size={14} className="fill-current" />
                <span className="text-[18px] font-extrabold leading-none">{score}/5</span>
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">{scoreLabel}</p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 gap-px bg-[#F0F0F0] sm:grid-cols-3">
          {[
            { icon: Mail, label: 'Email', value: application.email },
            { icon: Calendar, label: 'Candidature', value: submittedAt },
            { icon: User, label: 'Statut', value: null },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col gap-1 bg-white px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  <Icon size={11} />
                  {item.label}
                </p>
                {item.value !== null ? (
                  <p className="text-[13px] font-semibold text-[#0E0E10]">{item.value}</p>
                ) : (
                  <StatusBadge status={application.status} label={application.status_label} color={application.status_color} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Lettre de motivation</h2>
        <p className="whitespace-pre-wrap text-[14px] leading-[1.8] text-[#374151]">
          {application.motivation || <span className="italic text-[#9CA3AF]">Aucune lettre de motivation fournie.</span>}
        </p>
      </div>

      {/* Interview details (visible only when status = interview) */}
      {application.status === 'interview' && (application.interview_date || application.interview_location) && (
        <div className="overflow-hidden rounded-2xl border border-[#FDE68A] bg-amber-50 p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">Entretien planifié</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            {application.interview_date && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Date</p>
                  <p className="text-[14px] font-bold text-[#0E0E10]">
                    {new Intl.DateTimeFormat('fr-FR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(application.interview_date))}
                  </p>
                </div>
              </div>
            )}
            {application.interview_location && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Lieu</p>
                  <p className="text-[14px] font-bold text-[#0E0E10]">{application.interview_location}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions + status */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Actions</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Portfolio */}
          {application.portfolio ? (
            <a
              href={application.portfolio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] transition hover:border-[#F2600C] hover:text-[#F2600C]"
            >
              <ExternalLink size={14} />
              Voir le portfolio
            </a>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-[13px] font-medium text-[#D1D5DB]">
              <ExternalLink size={14} />
              Portfolio non fourni
            </span>
          )}

          {/* CV */}
          {application.cv ? (
            <button
              type="button"
              onClick={() => void handleDownloadCv()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F2600C] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#D44F08]"
            >
              <Download size={14} />
              Télécharger le CV
            </button>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-[13px] font-medium text-[#D1D5DB]">
              <Download size={14} />
              CV non fourni
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-[#F0F0F0] pt-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Modifier le statut</p>
          <StatusSelector
            applicationId={application.id}
            currentStatus={application.status}
            onStatusUpdated={handleStatusUpdated}
          />
        </div>
      </div>
    </section>
  );
}
