'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MAIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/candidatures', label: 'Candidatures', icon: '🧾' },
  { href: '/admin/postes', label: 'Postes', icon: '💼' },
];

/**
 * Admin shell with responsive sidebar navigation.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#fafaf9]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:min-h-[calc(100vh-3.5rem)] lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-[#e5e5e5] bg-white p-4 lg:w-72 lg:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Administration</p>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.02em] text-[#0f0f0f]">Espace entreprise</p>
          </div>

          <nav className="mt-5 flex flex-col gap-2">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0f0f0f] text-white'
                      : 'text-[#44403c] hover:bg-[#f5f5f4] hover:text-[#0f0f0f]'
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-[#e5e5e5] pt-4 lg:mt-auto">
            <Link
              href="/admin/parametres"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === '/admin/parametres'
                  ? 'bg-[#0f0f0f] text-white'
                  : 'text-[#44403c] hover:bg-[#f5f5f4] hover:text-[#0f0f0f]'
              }`}
            >
              <span aria-hidden="true">⚙️</span>
              <span>Paramètres</span>
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
