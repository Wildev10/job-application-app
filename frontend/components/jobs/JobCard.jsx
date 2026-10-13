'use client';

import { ArrowRight, CalendarClock, Clock3, Link2, MapPin, PencilLine, Users } from 'lucide-react';
import { daysFromToday, formatPastDate, formatShortDate } from '@/lib/date';

const STATUS_CONFIG = {
  open:   { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500', label: 'Ouvert' },
  closed: { pill: 'bg-[#F3F4F6] text-[#6B7280] ring-[#6B7280]/15', dot: 'bg-[#9CA3AF]', label: 'Clôturé' },
  draft:  { pill: 'bg-amber-50 text-amber-700 ring-amber-600/15', dot: 'bg-amber-400', label: 'Brouillon' },
};

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F5F5F5] hover:text-[#0E0E10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2600C]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

function expiryInfo(expiresAt, isOpen) {
  const days = daysFromToday(expiresAt);
  if (days === null) {
    return { label: 'Sans date limite', tone: 'text-[#9CA3AF]' };
  }
  if (days < 0) {
    return { label: `Expiré le ${formatShortDate(expiresAt)}`, tone: 'text-[#9CA3AF]' };
  }
  if (!isOpen) {
    return { label: `Échéance ${formatShortDate(expiresAt)}`, tone: 'text-[#9CA3AF]' };
  }
  if (days === 0) return { label: "Expire aujourd'hui", tone: 'text-red-600', urgent: true };
  if (days <= 7) return { label: `Expire dans ${days} j`, tone: 'text-amber-700', urgent: true };
  return { label: `Jusqu'au ${formatShortDate(expiresAt)}`, tone: 'text-[#6B7280]' };
}

function publishedLabel(createdAt) {
  const days = daysFromToday(createdAt);
  if (days !== null && days > -7) {
    return `Publié ${formatPastDate(createdAt).toLowerCase()}`;
  }
  return `Publié le ${formatShortDate(createdAt)}`;
}

/**
 * Job summary card for the admin jobs page.
 */
export default function JobCard({ job, onEdit, onClose, onViewApplications, onCopyLink }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
  const isOpen = job.status === 'open';
  const count = Number(job.applications_count || 0);
  const expiry = expiryInfo(job.expires_at, isOpen);

  return (
    <article
      className={`group flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isOpen ? 'border-[#E8E8E8] hover:border-[#F2600C]/30' : 'border-[#EDEDED]'
      }`}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Status + quick actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${config.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
            <span className="truncate rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[11.5px] font-medium text-[#6B7280]">
              {job.type_label || job.type}
            </span>
          </div>
          <div className="-mr-1.5 flex shrink-0 items-center">
            <button
              type="button"
              onClick={onCopyLink}
              disabled={!isOpen}
              title={isOpen ? 'Copier le lien public' : 'Poste clôturé'}
              aria-label="Copier le lien public du poste"
              className={iconButton}
            >
              <Link2 size={15} />
            </button>
            <button type="button" onClick={onEdit} title="Modifier le poste" aria-label="Modifier le poste" className={iconButton}>
              <PencilLine size={15} />
            </button>
          </div>
        </div>

        {/* Title + meta */}
        <button type="button" onClick={onViewApplications} className="mt-3 text-left focus-visible:outline-none">
          <h3
            className={`line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.015em] transition-colors group-hover:text-[#F2600C] ${
              isOpen ? 'text-[#0E0E10]' : 'text-[#6B7280]'
            }`}
          >
            {job.title}
          </h3>
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#6B7280]">
          <span className="font-medium text-[#374151]">{job.role}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} className="text-[#9CA3AF]" />
            {job.location || 'Lieu non précisé'}
          </span>
          {job.created_at && (
            <span className="inline-flex items-center gap-1" title={formatShortDate(job.created_at, true)}>
              <Clock3 size={13} className="text-[#9CA3AF]" />
              {publishedLabel(job.created_at)}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 rounded-xl bg-[#FAFAFA] px-4 py-3 ring-1 ring-inset ring-[#F0F0F0]">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-extrabold leading-none tracking-tight text-[#0E0E10] tabular-nums">{count}</span>
                <span className="text-[12.5px] font-medium text-[#6B7280]">candidature{count > 1 ? 's' : ''}</span>
              </p>
            </div>
            <p className={`inline-flex items-center gap-1 text-[12px] font-semibold ${expiry.tone}`}>
              <CalendarClock size={13} />
              {expiry.label}
            </p>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-[#F0F0F0] px-5 py-3">
        <button
          type="button"
          onClick={onViewApplications}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#F2600C] transition hover:text-[#D44F08] focus-visible:outline-none focus-visible:underline"
        >
          <Users size={14} />
          Voir les candidatures
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>

        {isOpen ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#6B7280] transition hover:bg-red-50 hover:text-red-600"
          >
            Clôturer
          </button>
        ) : (
          <span className="px-2.5 py-1.5 text-[12.5px] font-medium text-[#9CA3AF]">Poste clôturé</span>
        )}
      </div>
    </article>
  );
}
