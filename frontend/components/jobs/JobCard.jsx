'use client';

/**
 * Display a single job card with actions for admin management.
 */
export default function JobCard({ job, onEdit, onClose, onViewApplications }) {
  const statusMap = {
    open: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
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
    <article className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[job.status] || statusMap.draft}`}>
          {job.status_label || statusLabelMap[job.status] || 'Brouillon'}
        </span>
        <span className="text-xs text-[#6b7280]">#{job.id}</span>
      </div>

      <h3 className="truncate text-xl font-extrabold tracking-[-0.01em] text-[#111827]" title={job.title}>{job.title}</h3>

      <div className="mt-3 space-y-1 text-sm text-[#4b5563]">
        <p>👤 {job.role}</p>
        <p>📄 {job.type_label || job.type}</p>
        <p>📍 {job.location || 'Non précisée'}</p>
      </div>

      <p className="mt-4 text-sm font-medium text-[#374151]">
        {job.applications_count || 0} candidature(s)
      </p>

      {expiresAt && (
        <p className={`mt-2 text-sm font-medium ${isSoon ? 'text-orange-600' : 'text-[#6b7280]'}`}>
          Expire le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(expiresAt)}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onViewApplications}
          className="w-fit rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Voir candidatures
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-fit rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={job.status === 'closed'}
          className="w-fit rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Clôturer
        </button>
      </div>
    </article>
  );
}
