'use client';

import { useMemo } from 'react';
import { Briefcase, Download, ExternalLink, Star } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import type { Application } from '@/app/types/application';
import StatusBadge from '@/app/components/StatusBadge';
import StatusSelector from '@/app/components/StatusSelector';
import { downloadApplicationCv } from '@/lib/api';

interface ApplicationCardProps {
  application: Application;
  onStatusUpdated: (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color'>) => void;
}

const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
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
 * Present one application with expandable motivation and useful links.
 */
export default function ApplicationCard({ application, onStatusUpdated }: ApplicationCardProps) {
  const motivationPreview = useMemo(() => {
    if (application.motivation.length <= 120) {
      return application.motivation;
    }
    return `${application.motivation.slice(0, 120)}...`;
  }, [application.motivation]);

  const openMotivationPopup = async (): Promise<void> => {
    await Alert.fire({
      icon: 'info',
      title: 'Motivation complète',
      text: application.motivation,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#0F0F0F',
      background: '#FAFAF9',
      color: '#0F0F0F',
      customClass: {
        popup: 'rounded-md',
        confirmButton: 'px-6 py-2 text-sm font-medium',
      },
    });
  };

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

  const submittedAt = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(application.created_at));

  const score = Math.max(0, Math.min(5, application.score || 0));
  const scoreClass =
    score >= 4
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : score >= 2
        ? 'bg-orange-50 text-orange-700 border border-orange-200'
        : 'bg-red-50 text-red-600 border border-red-200';

  const initials = (application.nom || 'C')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';

  const avatarColor = getAvatarColor(application.nom || 'C');

  return (
    <article
      className="group rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#1EB88A]/40 hover:shadow-md"
      style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">

        {/* Avatar */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold ${avatarColor.bg} ${avatarColor.text}`}>
          {initials}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Name + role + email */}
          <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
            <h3 className="text-[16px] font-bold tracking-[-0.01em] text-[#111827]">{application.nom}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[12px] font-medium text-[#4B5563]">
              <Briefcase size={11} className="opacity-60" />
              {application.role}
            </span>
          </div>
          <p className="text-[12px] text-[#9CA3AF]">{application.email}</p>

          {/* Score badge */}
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${scoreClass}`}>
            <Star size={12} className="fill-current" />
            <span>{score}/5</span>
          </div>

          {/* Motivation preview */}
          <p
            className="text-[13px] leading-[1.65] text-[#4B5563]"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {motivationPreview}
          </p>

          {application.motivation.length > 120 && (
            <button
              type="button"
              onClick={() => void openMotivationPopup()}
              className="text-[12px] font-medium text-[#1EB88A] transition hover:text-[#0F6E56]"
            >
              Lire la suite →
            </button>
          )}
        </div>

        {/* Right column: status + actions + date */}
        <div className="flex flex-col items-start gap-3 md:items-end md:shrink-0">
          <StatusBadge status={application.status} label={application.status_label} color={application.status_color} />
          <StatusSelector applicationId={application.id} currentStatus={application.status} onStatusUpdated={onStatusUpdated} />

          {/* Action icons */}
          <div className="flex items-center gap-1">
            {application.portfolio ? (
              <a
                href={application.portfolio}
                target="_blank"
                rel="noreferrer"
                title="Voir le portfolio"
                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[#6B7280] transition hover:border-[#1EB88A] hover:text-[#1EB88A]"
              >
                <ExternalLink size={14} />
              </a>
            ) : (
              <span title="Portfolio indisponible" className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[#D1D5DB]">
                <ExternalLink size={14} />
              </span>
            )}

            {application.cv ? (
              <button
                type="button"
                onClick={() => void handleDownloadCv()}
                title="Télécharger le CV"
                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[#6B7280] transition hover:border-[#1EB88A] hover:text-[#1EB88A]"
              >
                <Download size={14} />
              </button>
            ) : (
              <span title="CV non fourni" className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[#D1D5DB]">
                <Download size={14} />
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#9CA3AF]">{submittedAt}</p>
        </div>
      </div>
    </article>
  );
}
