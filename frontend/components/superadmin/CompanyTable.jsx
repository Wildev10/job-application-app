import {
  Ban,
  CheckCircle,
  Eye,
  LogIn,
} from 'lucide-react';

function activityClass(lastActivityAt) {
  if (!lastActivityAt) {
    return 'text-gray-600';
  }

  const diffDays = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return 'text-emerald-400';
  }
  if (diffDays <= 30) {
    return 'text-amber-400';
  }
  return 'text-red-400';
}

function activityLabel(lastActivityAt) {
  if (!lastActivityAt) {
    return 'Jamais';
  }

  const diffDays = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return 'Aujourd\'hui';
  }
  if (diffDays === 1) {
    return 'Il y a 1 jour';
  }
  return `Il y a ${diffDays} jours`;
}

/**
 * Render the super admin companies table with row actions.
 */
export default function CompanyTable({ rows, onView, onSuspend, onActivate, onImpersonate }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-800/50">
          <tr>
            {['Entreprise', 'Plan', 'Candidatures', 'Postes', 'Dernière activité', 'Statut', 'Actions'].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900">
          {rows.map((company) => (
            <tr key={company.id} className="hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-white">{company.name}</p>
                <p className="text-xs text-gray-400">{company.email}</p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                    company.plan === 'pro'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-600 bg-gray-700 text-gray-400',
                  ].join(' ')}
                >
                  {company.plan === 'pro' ? 'Pro' : 'Starter'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">{company.applications_count}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{company.jobs_count}</td>
              <td className={`px-4 py-3 text-sm ${activityClass(company.last_activity_at)}`}>
                {activityLabel(company.last_activity_at)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    company.is_suspended
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-emerald-500/10 text-emerald-400',
                  ].join(' ')}
                >
                  {company.is_suspended ? 'Suspendue' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <button type="button" onClick={() => onView(company)} className="hover:text-white" title="Voir">
                    <Eye size={16} />
                  </button>
                  {company.is_suspended ? (
                    <button type="button" onClick={() => onActivate(company)} className="hover:text-emerald-400" title="Activer">
                      <CheckCircle size={16} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => onSuspend(company)} className="hover:text-amber-400" title="Suspendre">
                      <Ban size={16} />
                    </button>
                  )}
                  <button type="button" onClick={() => onImpersonate(company)} className="hover:text-blue-400" title="Impersonate">
                    <LogIn size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
