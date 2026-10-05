'use client';

/**
 * Render a colored usage bar for Starter plan limits.
 */
export default function PlanLimitBar({ current = 0, limit = 0, label = '', color }) {
  const safeLimit = Number(limit || 0);
  const safeCurrent = Math.max(0, Number(current || 0));
  const rawPercent = safeLimit > 0 ? (safeCurrent / safeLimit) * 100 : 0;
  const percentage = Math.min(100, Math.round(rawPercent));

  let progressClass = color || 'bg-[#1EB88A]';
  if (!color) {
    if (percentage >= 100) {
      progressClass = 'bg-[#EF4444]';
    } else if (percentage >= 75) {
      progressClass = 'bg-[#F59E0B]';
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#374151]">{label}</p>
        <p className="text-[13px] font-bold text-[#111827]">
          {safeCurrent}
          <span className="font-normal text-[#9CA3AF]"> / {safeLimit}</span>
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage >= 100 && (
        <p className="text-[12px] font-medium text-[#EF4444]">
          Limite atteinte — passez au plan Pro pour continuer.
        </p>
      )}
    </div>
  );
}
