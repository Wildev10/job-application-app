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
        isDev ? 'border-l-teal-500 text-teal-700' : 'border-l-slate-500 text-slate-700',
      ].join(' ')}
    >
      {role}
    </span>
  );
}
