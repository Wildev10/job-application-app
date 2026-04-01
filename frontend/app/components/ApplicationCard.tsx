'use client';

import { useMemo } from 'react';
import Swal from 'sweetalert2';
import type { Application } from '@/app/types/application';
import RoleBadge from '@/app/components/RoleBadge';
import ScoreBadge from '@/app/components/ScoreBadge';
import StatusBadge from '@/app/components/StatusBadge';
import StatusSelector from '@/app/components/StatusSelector';
import { getCvPublicUrl } from '@/app/lib/api';

interface ApplicationCardProps {
  application: Application;
  onStatusUpdated: (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color'>) => void;
}

/**
 * Present one application with expandable motivation and useful links.
 */
export default function ApplicationCard({ application, onStatusUpdated }: ApplicationCardProps) {
  const motivationPreview = useMemo(() => {
    if (application.motivation.length <= 100) {
      return application.motivation;
    }

    return `${application.motivation.slice(0, 100)}...`;
  }, [application.motivation]);

  const openMotivationPopup = async (): Promise<void> => {
    await Swal.fire({
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

  const cvUrl = getCvPublicUrl(application.cv);
  const submittedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(application.created_at));

  return (
    <article className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-center lg:gap-6">
      <header className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-bold tracking-[-0.01em] text-[#0f0f0f] sm:text-lg">{application.nom}</h3>
          <RoleBadge role={application.role} />
          <ScoreBadge score={application.score} />
        </div>
        <p className="break-all text-sm text-[#525252]">{application.email}</p>
      </header>

      <div className="min-w-0 space-y-2 text-sm text-[#525252]">
        <p className="break-words leading-relaxed">
          {motivationPreview}{' '}
          {application.motivation.length > 100 && (
            <button
              type="button"
              onClick={() => void openMotivationPopup()}
              className="border-b border-[#0f0f0f] pb-0.5 font-medium text-[#0f0f0f] hover:border-[#ff4d00] hover:text-[#ff4d00]"
            >
              voir plus
            </button>
          )}
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {/* Keep current status visible and editable from the same admin row. */}
        <StatusBadge
          status={application.status}
          label={application.status_label}
          color={application.status_color}
        />
        <StatusSelector
          applicationId={application.id}
          currentStatus={application.status}
          onStatusUpdated={onStatusUpdated}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <p className="text-[#737373]">{submittedAt}</p>

        <p className="break-words">
          {application.portfolio ? (
            <a
              href={application.portfolio}
              target="_blank"
              rel="noreferrer"
              className="break-all border-b border-[#0f0f0f] pb-0.5 font-medium text-[#0f0f0f] hover:border-[#ff4d00] hover:text-[#ff4d00]"
            >
              Portfolio
            </a>
          ) : (
            <span className="text-[#a3a3a3]">Portfolio indisponible</span>
          )}
        </p>

        <p>
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="border-b border-[#0f0f0f] pb-0.5 font-medium text-[#0f0f0f] hover:border-[#ff4d00] hover:text-[#ff4d00]"
            >
              Télécharger
            </a>
          ) : (
            <span className="text-[#a3a3a3]">CV non fourni</span>
          )}
        </p>
      </div>
    </article>
  );
}
