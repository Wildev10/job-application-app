'use client';
// FIX-CONTRAST: lisibilite corrigee

import { Archive, Briefcase, CalendarDays, Eye, MapPin, PencilLine, Users } from 'lucide-react';

/**
 * Display a single job card with actions for admin management.
 */
export default function JobCard({ job, onEdit, onClose, onViewApplications }) {
  const statusMap = {
    open: 'bg-teal-100 text-teal-800',
    closed: 'bg-slate-100 text-slate-700',
    draft: 'bg-amber-100 text-amber-800',
  };

  const statusLabelMap = {
    open: 'Ouvert',
    closed: 'Fermé',
    draft: 'Brouillon',
  };

  const expiresAt = job?.expires_at ? new Date(job.expires_at) : null;
  const now = new Date();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const isSoon = expiresAt ? expiresAt.getTime() - now.getTime() <= sevenDays && expiresAt.getTime() > now.getTime() : false;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-extrabold tracking-[-0.01em] text-slate-900" title={job.title}>{job.title}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            Réf. poste #{job.id}
          </p>
        </div>

        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[job.status] || statusMap.draft}`}>
          {job.status_label || statusLabelMap[job.status] || 'Brouillon'}
        </span>
      </header>

      <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-teal-600" />
          <span className="font-medium text-slate-900">Rôle:</span>
          <span>{job.role}</span>
        </div>
        <div className="flex items-center gap-2">
          <PencilLine size={15} className="text-teal-600" />
          <span className="font-medium text-slate-900">Type:</span>
          <span>{job.type_label || job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-teal-600" />
          <span className="font-medium text-slate-900">Lieu:</span>
          <span>{job.location || 'Non précisée'}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
          <Users size={15} />
          {job.applications_count || 0} candidature(s)
        </p>
      </div>

      {expiresAt && (
        <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isSoon ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
          <CalendarDays size={14} />
          Expire le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(expiresAt)}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onViewApplications}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Eye size={14} />
          Voir candidatures
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <PencilLine size={14} />
          Modifier
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={job.status === 'closed'}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Archive size={14} />
          Clôturer
        </button>
      </div>
    </article>
  );
}
