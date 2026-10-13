'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarClock, ChevronRight, FileDown } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import type { Application } from '@/app/types/application';
import StatusSelector from '@/app/components/StatusSelector';
import { downloadApplicationCv } from '@/lib/api';
import { formatInterviewDate, formatPastDate, formatShortDate } from '@/lib/date';

interface ApplicationCardProps {
  application: Application;
  onStatusUpdated: (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color' | 'interview_date' | 'interview_location'>) => void;
}

export const APPLICATION_GRID_COLUMNS =
  'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_64px_164px_80px_108px]';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-lime-100 text-lime-800',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function scoreTone(score: number) {
  if (score >= 8) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
  if (score >= 5) return { bar: 'bg-amber-400', text: 'text-amber-700' };
  return { bar: 'bg-rose-400', text: 'text-rose-600' };
}

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#6B7280] transition hover:border-[#F2600C]/40 hover:bg-[#FFF4EE] hover:text-[#F2600C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2600C]/30';
const iconButtonDisabled =
  'flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-[#F0F0F0] text-[#D9D9D9]';

/**
 * One application rendered as a table row on desktop and a compact card on mobile.
 */
export default function ApplicationCard({ application, onStatusUpdated }: ApplicationCardProps) {
  const handleDownloadCv = async (): Promise<void> => {
    try {
      await downloadApplicationCv(application.id);
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Téléchargement impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#DC2626',
      });
    }
  };

  const score = Math.max(0, Math.min(10, Math.round(application.score || 0)));
  const tone = scoreTone(score);
  const name = application.nom || 'Candidat';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
  const profileHref = `/admin/candidatures/${application.id}`;
  const showInterview = application.status === 'interview' && application.interview_date;

  return (
    <article
      className={`group grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-[#FCFCFC] sm:px-5 lg:items-center lg:gap-5 lg:py-3.5 ${APPLICATION_GRID_COLUMNS}`}
    >
      {/* Candidate */}
      <div className="flex min-w-0 items-center gap-3 lg:order-1">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${getAvatarColor(name)}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <Link
            href={profileHref}
            className="block truncate text-[14px] font-semibold text-[#0E0E10] transition hover:text-[#F2600C] focus-visible:outline-none focus-visible:underline"
          >
            {name}
          </Link>
          <p className="truncate text-[12.5px] text-[#6B7280]">{application.email}</p>
        </div>
      </div>

      {/* Job + score + date — one wrapped line on mobile, separate columns on desktop */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:pl-[52px] lg:contents">
        <div className="min-w-0 basis-full sm:basis-auto lg:order-2">
          <p className="truncate text-[13px] font-medium text-[#374151]" title={application.job_title || undefined}>
            {application.job_title || <span className="text-[#9CA3AF]">Candidature spontanée</span>}
          </p>
          <span className="mt-1 inline-flex max-w-full items-center rounded-md bg-[#F5F5F5] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]">
            <span className="truncate">{application.role}</span>
          </span>
        </div>

        <div className="lg:order-3" title={`Score : ${score}/10`}>
          <p className="text-[13px] font-bold tabular-nums text-[#0E0E10]">
            <span className={tone.text}>{score}</span>
            <span className="font-medium text-[#9CA3AF]">/10</span>
          </p>
          <div className="mt-1.5 h-1 w-14 overflow-hidden rounded-full bg-[#F0F0F0]">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score * 10}%` }} />
          </div>
        </div>

        <p
          className="text-[12.5px] text-[#6B7280] tabular-nums lg:order-5"
          title={formatShortDate(application.created_at, true)}
        >
          {formatPastDate(application.created_at)}
        </p>
      </div>

      {/* Status + actions — one line on mobile, separate columns on desktop */}
      <div className="flex items-start justify-between gap-3 sm:pl-[52px] lg:contents">
        <div className="shrink-0 lg:order-4">
          <StatusSelector applicationId={application.id} currentStatus={application.status} onStatusUpdated={onStatusUpdated} />
          {showInterview && (
            <p
              className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-[#92400E]"
              title={application.interview_location ? `Lieu : ${application.interview_location}` : undefined}
            >
              <CalendarClock size={12} className="shrink-0" />
              <span className="truncate">{formatInterviewDate(application.interview_date)}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 lg:order-6">
          {application.cv ? (
            <button type="button" onClick={() => void handleDownloadCv()} title="Télécharger le CV" aria-label="Télécharger le CV" className={iconButton}>
              <FileDown size={15} />
            </button>
          ) : (
            <span title="CV non fourni" className={iconButtonDisabled}>
              <FileDown size={15} />
            </span>
          )}

          {application.portfolio ? (
            <a href={application.portfolio} target="_blank" rel="noreferrer" title="Ouvrir le portfolio" aria-label="Ouvrir le portfolio" className={iconButton}>
              <ArrowUpRight size={15} />
            </a>
          ) : (
            <span title="Portfolio non fourni" className={iconButtonDisabled}>
              <ArrowUpRight size={15} />
            </span>
          )}

          <Link href={profileHref} title="Voir le profil complet" aria-label="Voir le profil complet" className={iconButton}>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
