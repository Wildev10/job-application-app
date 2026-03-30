import type { Role } from '@/app/types/application';

interface RoleBadgeProps {
  role: Role;
}

/**
 * Display role with dedicated semantic color.
 */
export default function RoleBadge({ role }: RoleBadgeProps) {
  const isDev = role === 'dev';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        isDev ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800',
      ].join(' ')}
    >
      {role}
    </span>
  );
}
