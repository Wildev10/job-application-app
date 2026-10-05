'use client';

import { Archive, Briefcase, CalendarDays, Eye, MapPin, PencilLine, Users } from 'lucide-react';

const STATUS_CONFIG = {
  open:   { bar: 'bg-[#1EB88A]', badge: 'bg-[#ECFDF5] text-[#065F46]', dot: 'bg-[#10B981]', label: 'Ouvert' },
  closed: { bar: 'bg-[#9CA3AF]', badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]', label: 'Fermé' },
  draft:  { bar: 'bg-[#F59E0B]', badge: 'bg-[#FFFBEB] text-[#92400E]', dot: 'bg-[#F59E0B]', label: 'Brouillon' },
};

/**
 * Display a single job card with actions for admin management.
 */
export default function JobCard({ job, onEdit, onClose, onViewApplications }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;

  const expiresAt = job?.expires_at ? new Date(job.expires_at) : null;
  const now = new Date();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const isExpiringSoon = expiresAt
    ? expiresAt.getTime() - now.getTime() <= sevenDays && expiresAt.getTime() > now.getTime()
    : false;

  return (
    <article
      className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-md"
      style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      {/* Color strip by status */}
      <div className={`h-1 w-full ${config.bar}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[18px] font-bold tracking-[-0.02em] text-[#111827]" title={job.title}>
              {job.title}
            </h3>
            <span className="mt-1.5 inline-block rounded-[6px] bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
              Réf. #{job.id}
            </span>
          </div>

          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${config.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {job.status_label || config.label}
          </span>
        </div>

        {/* Info grid */}
        <div className="my-4 rounded-[10px] bg-[#F9FAFB] px-4 py-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Briefcase size={14} className="shrink-0 text-[#1EB88A]" />
              <span className="w-12 text-[12px] text-[#9CA3AF]">Rôle</span>
              <span className="text-[13px] font-medium text-[#111827]">{job.role}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <PencilLine size={14} className="shrink-0 text-[#1EB88A]" />
              <span className="w-12 text-[12px] text-[#9CA3AF]">Type</span>
              <span className="text-[13px] font-medium text-[#111827]">{job.type_label || job.type}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="shrink-0 text-[#1EB88A]" />
              <span className="w-12 text-[12px] text-[#9CA3AF]">Lieu</span>
              <span className="text-[13px] font-medium text-[#111827]">{job.location || 'Non précisée'}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#ECFDF5] px-3 py-1.5 text-[13px] font-medium text-[#065F46]">
            <Users size={14} />
            {job.applications_count || 0} candidature{(job.applications_count || 0) !== 1 ? 's' : ''}
          </div>

          {expiresAt && (
            <div className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium ${
              isExpiringSoon
                ? 'bg-[#FEF9C3] text-[#854D0E]'
                : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
              <CalendarDays size={13} className={isExpiringSoon ? 'text-[#F59E0B]' : ''} />
              Expire le {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(expiresAt)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onViewApplications}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#1EB88A] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0F6E56]"
          >
            <Eye size={14} />
            Voir candidatures
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            <PencilLine size={14} />
            Modifier
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={job.status === 'closed'}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#FECACA] bg-white px-3.5 py-2 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:text-[#9CA3AF]"
          >
            <Archive size={14} />
            Clôturer
          </button>
        </div>
      </div>
    </article>
  );
}
