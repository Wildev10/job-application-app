'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, ClipboardList, LayoutDashboard, Settings } from 'lucide-react';
import PlanBadge from '@/components/PlanBadge';
import { PlanStatusProvider, usePlanStatus } from '@/hooks/usePlanStatus';
import { getCompany } from '@/lib/auth';
// FIX-CONTRAST: lisibilite corrigee

const MAIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/candidatures', label: 'Candidatures', icon: ClipboardList },
  { href: '/admin/postes', label: 'Postes', icon: BriefcaseBusiness },
];

/**
 * Admin shell with responsive sidebar navigation.
 */
function AdminLayoutShell({ children }) {
  const pathname = usePathname();
  const { planLimits, isStarter } = usePlanStatus();
  const [companyName, setCompanyName] = useState(() => getCompany()?.name || 'Entreprise');
  const [impersonationCompanyName, setImpersonationCompanyName] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const token = localStorage.getItem('impersonate_token');
    return token ? (localStorage.getItem('impersonate_company_name') || '') : '';
  });

  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem('impersonate_token');
      setImpersonationCompanyName(token ? (localStorage.getItem('impersonate_company_name') || '') : '');
      setCompanyName(getCompany()?.name || 'Entreprise');
    };

    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const stopImpersonation = () => {
    localStorage.removeItem('impersonate_token');
    localStorage.removeItem('impersonate_company_name');
    setImpersonationCompanyName('');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:min-h-[calc(100vh-3.5rem)] lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:w-72 lg:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Administration</p>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.02em] text-white">Espace entreprise</p>
            <p className="mt-1 text-xs text-slate-400">{companyName}</p>
            <div className="mt-3">
              <PlanBadge plan={planLimits?.plan || 'starter'} size="sm" />
            </div>
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
            {isStarter && (
              <div className="mx-2 mb-4 rounded-xl border border-teal-500/20 bg-teal-900/20 p-3">
                <p className="text-xs font-semibold text-teal-300">✦ Passez au Pro</p>
                <p className="mt-1 text-xs text-teal-400/90">Postes illimités, stats avancées...</p>
                <Link
                  href="/admin/upgrade"
                  className="mt-2 inline-flex text-xs font-semibold text-teal-400 transition hover:text-teal-300"
                >
                  Voir les offres →
                </Link>
              </div>
            )}

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

        <main className="min-w-0 flex-1">
          {impersonationCompanyName ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">
                ⚠️ Mode impersonation - Vous visualisez l&apos;espace de {impersonationCompanyName}
              </span>
              <button
                type="button"
                onClick={stopImpersonation}
                className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Quitter
              </button>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Wrap admin layout content with plan status context.
 */
export default function AdminLayout({ children }) {
  return (
    <PlanStatusProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </PlanStatusProvider>
  );
}
