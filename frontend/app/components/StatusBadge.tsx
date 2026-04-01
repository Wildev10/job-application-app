import type { ApplicationStatusColor } from '@/app/types/application';

interface StatusBadgeProps {
  status: string;
  label: string;
  color: ApplicationStatusColor;
}

const COLOR_CLASS_MAP: Record<ApplicationStatusColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
};

/**
 * Render a colored status badge using backend-provided label and color.
 */
export default function StatusBadge({ status, label, color }: StatusBadgeProps) {
  const colorClass = COLOR_CLASS_MAP[color] ?? COLOR_CLASS_MAP.gray;

  return (
    <span
      title={status}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
