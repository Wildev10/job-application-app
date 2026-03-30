'use client';

import { useMemo, useState } from 'react';
import type { Application } from '@/app/types/application';
import RoleBadge from '@/app/components/RoleBadge';
import ScoreBadge from '@/app/components/ScoreBadge';
import { getCvPublicUrl } from '@/app/lib/api';

interface ApplicationCardProps {
  application: Application;
}

/**
 * Present one application with expandable motivation and useful links.
 */
export default function ApplicationCard({ application }: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const motivationPreview = useMemo(() => {
    if (application.motivation.length <= 100 || expanded) {
      return application.motivation;
    }

    return `${application.motivation.slice(0, 100)}...`;
  }, [application.motivation, expanded]);

  const cvUrl = getCvPublicUrl(application.cv);
  const submittedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(application.created_at));

  return (
    <article className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900">{application.nom}</h3>
          <p className="break-all text-sm text-slate-600">{application.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge role={application.role} />
          <ScoreBadge score={application.score} />
        </div>
      </header>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <p>
          <span className="font-medium text-slate-900">Motivation :</span> {motivationPreview}{' '}
          {application.motivation.length > 100 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {expanded ? 'voir moins' : 'voir plus'}
            </button>
          )}
        </p>

        <p className="break-words">
          <span className="font-medium text-slate-900">Portfolio :</span>{' '}
          {application.portfolio ? (
            <a
              href={application.portfolio}
              target="_blank"
              rel="noreferrer"
              className="break-all font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {application.portfolio}
            </a>
          ) : (
            <span className="text-slate-500">Non renseigné</span>
          )}
        </p>

        <p>
          <span className="font-medium text-slate-900">CV :</span>{' '}
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Télécharger
            </a>
          ) : (
            <span className="text-slate-500">Non fourni</span>
          )}
        </p>

        <p>
          <span className="font-medium text-slate-900">Soumise le :</span> {submittedAt}
        </p>
      </div>
    </article>
  );
}
