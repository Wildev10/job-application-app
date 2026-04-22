'use client';

/**
 * Render a colored usage bar for Starter plan limits.
 */
export default function PlanLimitBar({ current = 0, limit = 0, label = '', color }) {
  const safeLimit = Number(limit || 0);
  const safeCurrent = Math.max(0, Number(current || 0));
  const rawPercent = safeLimit > 0 ? (safeCurrent / safeLimit) * 100 : 0;
  const percentage = Math.min(100, Math.round(rawPercent));

  let progressClass = color || 'bg-teal-500';
  if (!color) {
    if (percentage >= 85) {
      progressClass = 'bg-red-500';
    } else if (percentage >= 60) {
      progressClass = 'bg-amber-500';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-medium text-slate-700">{label}</p>
        <p className="font-semibold text-slate-900">
          {safeCurrent} / {safeLimit}
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all duration-300 ${progressClass}`} style={{ width: `${percentage}%` }} />
      </div>

      {percentage >= 100 ? (
        <p className="text-xs text-red-600">🔒 Limite atteinte — Passez au Pro</p>
      ) : percentage > 85 ? (
        <p className="text-xs text-amber-600">⚠️ Limite presque atteinte</p>
      ) : null}
    </div>
  );
}
