'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BriefcaseBusiness, ChevronRight, ClipboardList, LayoutDashboard, Settings, Users, X } from 'lucide-react';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import PlanBadge from '@/components/PlanBadge';
import { PlanStatusProvider, usePlanStatus } from '@/hooks/usePlanStatus';
import { apiFetch } from '@/lib/api';
import { getCompany, getMember } from '@/lib/auth';

const MAIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/candidatures', label: 'Candidatures', icon: ClipboardList },
  { href: '/admin/postes', label: 'Postes', icon: BriefcaseBusiness },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart2 },
  { href: '/admin/equipe', label: 'Équipe', icon: Users },
];

function CompanyAvatar({ name }) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2600C] text-sm font-bold text-white shadow-md">
      {initials}
    </div>
  );
}

function AdminLayoutShell({ children }) {
  const pathname = usePathname();
  const { planLimits, isStarter } = usePlanStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const pendingIntervalRef = useRef(null);
  const [companyName, setCompanyName] = useState('Entreprise');
  const [memberName, setMemberName] = useState('');
  const [isOwner, setIsOwner] = useState(true);
  const [companyExpiryRaw, setCompanyExpiryRaw] = useState(null);
  const [impersonationCompanyName, setImpersonationCompanyName] = useState('');
  const [isExpiryBannerDismissed, setIsExpiryBannerDismissed] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      const company = getCompany();
      const member = getMember();
      const token = localStorage.getItem('impersonate_token');

      setCompanyName(company?.name || 'Entreprise');
      setMemberName(member?.name || '');
      setIsOwner(!member);
      setCompanyExpiryRaw(company?.plan_expires_at || null);
      setImpersonationCompanyName(token ? (localStorage.getItem('impersonate_company_name') || '') : '');
      setIsExpiryBannerDismissed(window.sessionStorage.getItem('pro_expiry_banner_dismissed') === '1');
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);

    return () => window.removeEventListener('storage', syncFromStorage);
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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:min-h-screen lg:flex-row lg:gap-6 lg:px-8 lg:py-8">

        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col rounded-2xl bg-[#0E0E10] lg:w-64 lg:sticky lg:top-8 lg:self-start">
          {/* Header */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3">
              <CompanyAvatar name={companyName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-white">{companyName}</p>
                {memberName ? (
                  <p className="mt-0.5 truncate text-[11px] text-[#737373]">{memberName} · Recruteur</p>
                ) : (
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#525252]">Espace entreprise</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <PlanBadge plan={planLimits?.plan || 'starter'} size="sm" />
            </div>
          </div>

          {/* Separator */}
          <div className="mx-4 h-px bg-white/5" />

          {/* Navigation */}
          <nav className="p-3 flex flex-col gap-0.5">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              const showBadge = item.href === '/admin/candidatures' && pendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F2600C] text-white shadow-lg shadow-[#F2600C]/20'
                      : 'text-[#737373] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : 'text-[#525252] group-hover:text-white transition-colors'}
                  />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-[#F2600C] text-white'}`}>
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                  {isActive && !showBadge && <ChevronRight size={14} className="opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto p-3 pt-0">
            <div className="mb-1 mx-1 h-px bg-white/5" />

            {isOwner && isStarter && (
              <div className="mb-2 rounded-xl border border-[#F2600C]/20 bg-gradient-to-br from-[#F2600C]/10 to-[#F2600C]/5 p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#F2600C]">Passez au Pro</span>
                  <span className="text-[#F2600C]">✦</span>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-[#F2600C]/60">Débloquez postes illimités, stats avancées et export CSV.</p>
                <Link
                  href="/admin/upgrade"
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F2600C] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#D44F08]"
                >
                  Voir les offres
                  <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {isOwner && (
              <Link
                href="/admin/parametres"
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  pathname === '/admin/parametres'
                    ? 'bg-[#F2600C] text-white shadow-lg shadow-[#F2600C]/20'
                    : 'text-[#737373] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Settings
                  size={16}
                  strokeWidth={pathname === '/admin/parametres' ? 2.5 : 2}
                  className={pathname === '/admin/parametres' ? 'text-white' : 'text-[#525252] group-hover:text-white transition-colors'}
                />
                <span className="flex-1">Paramètres</span>
                {pathname === '/admin/parametres' && <ChevronRight size={14} className="opacity-60" />}
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <EmailVerificationBanner />

          {showExpiryBanner && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm">
              <div>
                <p className="font-medium text-amber-800">
                  ⚠️ Votre plan Pro expire le {companyExpiryDate.toLocaleDateString('fr-FR')}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">Renouvelez maintenant pour ne pas perdre vos fonctionnalités.</p>
                <Link href="/admin/upgrade" className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900">
                  Renouveler <ChevronRight size={12} />
                </Link>
              </div>
              <button
                type="button"
                onClick={dismissExpiryBanner}
                className="mt-0.5 rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-100"
                aria-label="Fermer l'alerte expiration"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {impersonationCompanyName && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm shadow-sm">
              <span className="font-semibold text-red-700">
                ⚠️ Mode impersonation — Vous visualisez l&apos;espace de {impersonationCompanyName}
              </span>
              <button
                type="button"
                onClick={stopImpersonation}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Quitter
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <PlanStatusProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </PlanStatusProvider>
  );
}
