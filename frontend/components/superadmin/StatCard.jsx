import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const ICON_COLORS = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
};

/**
 * Display a dark themed super admin metric card with trend support.
 */
export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald', loading = false }) {
  if (loading) {
    return (
      <article className="rounded-xl border border-gray-700/50 bg-gray-900 p-5">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-800" />
        <div className="mt-5 h-8 w-28 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-4 w-36 animate-pulse rounded bg-gray-800" />
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-gray-700/50 bg-gray-900 p-5 transition-all hover:border-gray-600">
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-lg p-2.5 ${ICON_COLORS[color] || ICON_COLORS.emerald}`}>
          <Icon size={18} />
        </div>

        {trend && (
          <span
            className={[
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
            ].join(' ')}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="mt-5 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{title}</p>
      {subtitle && <p className="mt-2 text-xs text-gray-500">{subtitle}</p>}
    </article>
  );
}
