import type { ApplicationStatusColor } from '@/app/types/application';

interface StatusBadgeProps {
  status: string;
  label: string;
  color: ApplicationStatusColor;
}

const COLOR_CLASS_MAP: Record<ApplicationStatusColor, { badge: string; dot: string }> = {
  gray:   { badge: 'bg-[#F3F4F6] text-[#4B5563]',   dot: 'bg-[#9CA3AF]' },
  blue:   { badge: 'bg-[#EFF6FF] text-[#1D4ED8]',   dot: 'bg-[#3B82F6]' },
  yellow: { badge: 'bg-[#FFFBEB] text-[#92400E]',   dot: 'bg-[#F59E0B]' },
  green:  { badge: 'bg-[#ECFDF5] text-[#065F46]',   dot: 'bg-[#10B981]' },
  red:    { badge: 'bg-[#FEF2F2] text-[#991B1B]',   dot: 'bg-[#EF4444]' },
};

/**
 * Render a colored status badge using backend-provided label and color.
 */
export default function StatusBadge({ status, label, color }: StatusBadgeProps) {
  const scheme = COLOR_CLASS_MAP[color] ?? COLOR_CLASS_MAP.gray;

  return (
    <span
      title={status}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${scheme.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${scheme.dot}`} />
      {label}
    </span>
  );
}
