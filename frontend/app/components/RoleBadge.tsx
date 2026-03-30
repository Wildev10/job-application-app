import type { Role } from '@/app/types/application';

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
        isDev ? 'border-l-blue-500 text-blue-700' : 'border-l-purple-500 text-purple-700',
      ].join(' ')}
    >
      {role}
    </span>
  );
}
