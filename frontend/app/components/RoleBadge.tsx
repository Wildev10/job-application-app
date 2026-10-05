import type { Role } from '@/app/types/application';
// FIX-CONTRAST: lisibilite corrigee

interface RoleBadgeProps {
  role: Role;
}

/**
 * Display role as a minimal bordered text tag.
 */
export default function RoleBadge({ role }: RoleBadgeProps) {
  const isDev = role === 'dev';

  return (
    <span
      className={[
        'inline-flex items-center border-l-2 pl-2 text-xs font-semibold uppercase tracking-[0.12em] bg-transparent',
        isDev ? 'border-l-[#F2600C] text-[#F2600C]' : 'border-l-[#9CA3AF] text-[#6B7280]',
      ].join(' ')}
    >
      {role}
    </span>
  );
}
