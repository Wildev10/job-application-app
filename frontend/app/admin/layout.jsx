'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, ClipboardList, LayoutDashboard, Settings } from 'lucide-react';
// FIX-CONTRAST: lisibilite corrigee

const MAIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/candidatures', label: 'Candidatures', icon: ClipboardList },
  { href: '/admin/postes', label: 'Postes', icon: BriefcaseBusiness },
];

/**
 * Admin shell with responsive sidebar navigation.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:min-h-[calc(100vh-3.5rem)] lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:w-72 lg:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Administration</p>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.02em] text-white">Espace entreprise</p>
          </div>

          <nav className="mt-5 flex flex-col gap-2">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} strokeWidth={2.25} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-slate-800 pt-4 lg:mt-auto">
            <Link
              href="/admin/parametres"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === '/admin/parametres'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Settings size={16} strokeWidth={2.25} />
              <span>Paramètres</span>
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
