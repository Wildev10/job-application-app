import type { ApplicationStatusColor } from '@/app/types/application';
// FIX-CONTRAST: lisibilite corrigee

interface StatusBadgeProps {
  status: string;
  label: string;
  color: ApplicationStatusColor;
}

const COLOR_CLASS_MAP: Record<ApplicationStatusColor, string> = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
};

/**
 * Render a colored status badge using backend-provided label and color.
 */
export default function StatusBadge({ status, label, color }: StatusBadgeProps) {
  const colorClass = COLOR_CLASS_MAP[color] ?? COLOR_CLASS_MAP.gray;

  return (
    <span
      title={status}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
