'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BriefcaseBusiness, ClipboardList, LayoutDashboard, Settings, X } from 'lucide-react';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import PlanBadge from '@/components/PlanBadge';
import { PlanStatusProvider, usePlanStatus } from '@/hooks/usePlanStatus';
import { apiFetch } from '@/lib/api';
import { getCompany } from '@/lib/auth';

const MAIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/candidatures', label: 'Candidatures', icon: ClipboardList },
  { href: '/admin/postes', label: 'Postes', icon: BriefcaseBusiness },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart2 },
];

/**
 * Admin shell with responsive sidebar navigation.
 */
function AdminLayoutShell({ children }) {
  const pathname = usePathname();
  const { planLimits, isStarter } = usePlanStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const pendingIntervalRef = useRef(null);
  const [companyName, setCompanyName] = useState('Entreprise');
  const [companyExpiryRaw, setCompanyExpiryRaw] = useState(null);
  const [impersonationCompanyName, setImpersonationCompanyName] = useState('');
  const [isExpiryBannerDismissed, setIsExpiryBannerDismissed] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      const company = getCompany();
      const token = localStorage.getItem('impersonate_token');

      setCompanyName(company?.name || 'Entreprise');
      setCompanyExpiryRaw(company?.plan_expires_at || null);
      setImpersonationCompanyName(token ? (localStorage.getItem('impersonate_company_name') || '') : '');
      setIsExpiryBannerDismissed(window.sessionStorage.getItem('pro_expiry_banner_dismissed') === '1');
    };

    const onStorage = () => {
      syncFromStorage();
    };

    syncFromStorage();
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const data = await apiFetch('/company/onboarding-status', { method: 'GET' });
      setPendingCount(data?.pending_applications_count ?? 0);
    } catch {
      // ignore — badge simply doesn't update
    }
  }, []);

  useEffect(() => {
    void fetchPendingCount();
    pendingIntervalRef.current = window.setInterval(() => void fetchPendingCount(), 30_000);
    return () => {
      if (pendingIntervalRef.current !== null) window.clearInterval(pendingIntervalRef.current);
    };
  }, [fetchPendingCount]);

  const stopImpersonation = () => {
    localStorage.removeItem('impersonate_token');
    localStorage.removeItem('impersonate_company_name');
    setImpersonationCompanyName('');
  };

  const companyExpiryDate = companyExpiryRaw ? new Date(companyExpiryRaw) : null;
  const hasValidExpiry = companyExpiryDate && !Number.isNaN(companyExpiryDate.getTime());
  const nowDate = new Date();
  const expiresInLessThan7Days = hasValidExpiry
    ? companyExpiryDate.getTime() > nowDate.getTime()
      && companyExpiryDate.getTime() - nowDate.getTime() <= 7 * 24 * 60 * 60 * 1000
    : false;
  const showExpiryBanner = companyExpiryRaw !== null
    && planLimits?.is_pro === true
    && expiresInLessThan7Days
    && !isExpiryBannerDismissed;

  const dismissExpiryBanner = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('pro_expiry_banner_dismissed', '1');
    }

    setIsExpiryBannerDismissed(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:min-h-screen lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col rounded-2xl bg-[#0E0E10] p-4 lg:w-72 lg:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#525252]">Administration</p>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.02em] text-white">Espace entreprise</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{companyName}</p>
            <div className="mt-3">
              <PlanBadge plan={planLimits?.plan || 'starter'} size="sm" />
            </div>
          </div>

          <nav className="mt-5 flex flex-col gap-1">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              const showBadge = item.href === '/admin/candidatures' && pendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#F2600C] text-white'
                      : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} strokeWidth={2.25} />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-[#F2600C] text-white'}`}>
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/5 pt-4 lg:mt-auto">
            {isStarter && (
              <div className="mx-2 mb-4 rounded-xl border border-[#F2600C]/20 bg-[#F2600C]/10 p-3">
                <p className="text-xs font-semibold text-[#F2600C]">✦ Passez au Pro</p>
                <p className="mt-1 text-xs text-[#F2600C]/70">Postes illimités, stats avancées...</p>
                <Link
                  href="/admin/upgrade"
                  className="mt-2 inline-flex text-xs font-semibold text-[#F2600C] transition hover:text-white"
                >
                  Voir les offres →
                </Link>
              </div>
            )}

            <Link
              href="/admin/parametres"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === '/admin/parametres'
                  ? 'bg-[#F2600C] text-white'
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={16} strokeWidth={2.25} />
              <span>Paramètres</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <EmailVerificationBanner />

          {showExpiryBanner ? (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <div>
                <p className="text-amber-800">
                  ⚠️ Votre plan Pro expire le {companyExpiryDate.toLocaleDateString('fr-FR')}. Renouvelez maintenant pour ne pas perdre vos fonctionnalités.
                </p>
                <Link href="/admin/upgrade" className="mt-1 inline-flex font-semibold text-amber-700 hover:text-amber-800">
                  Renouveler →
                </Link>
              </div>
              <button
                type="button"
                onClick={dismissExpiryBanner}
                className="mt-1 rounded p-1 text-amber-700 transition hover:bg-amber-100"
                aria-label="Fermer l'alerte expiration"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}

          {impersonationCompanyName ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">
                ⚠️ Mode impersonation — Vous visualisez l&apos;espace de {impersonationCompanyName}
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
