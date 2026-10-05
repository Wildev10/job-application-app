"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileText,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import OnboardingBanner from '@/components/onboarding/OnboardingBanner';
import WelcomeToast from '@/components/onboarding/WelcomeToast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePlanStatus } from '@/hooks/usePlanStatus';

/**
 * Render the admin dashboard overview.
 */
export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, loading } = useOnboarding();
  const { planStatus, loading: planLoading } = usePlanStatus();
  const [showWelcomeToast, setShowWelcomeToast] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('welcome') === 'true';
  });

  const removeWelcomeQuery = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('welcome');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    setShowWelcomeToast(false);
  };

  const stats = useMemo(() => [
    {
      label: 'Postes publiés',
      value: status.jobs_count ?? 0,
      icon: Briefcase,
      color: 'bg-[#FFF4EE] text-[#F2600C]',
    },
    {
      label: 'Postes ouverts',
      value: status.open_jobs_count ?? 0,
      icon: Zap,
      color: 'bg-[#F0FDF4] text-[#22A559]',
    },
    {
      label: 'Candidatures reçues',
      value: status.applications_count ?? 0,
      icon: Users,
      color: 'bg-[#EFF6FF] text-[#3B82F6]',
    },
  ], [status.applications_count, status.jobs_count, status.open_jobs_count]);

  const quickLinks = [
    {
      href: '/admin/candidatures',
      icon: FileText,
      label: 'Candidatures',
      description: 'Consultez les profils, appliquez des filtres et modifiez les statuts.',
      badge: status.pending_applications_count > 0 ? `${status.pending_applications_count} en attente` : null,
    },
    {
      href: '/admin/postes',
      icon: Briefcase,
      label: 'Postes',
      description: 'Gérez vos offres d\'emploi et suivez les candidatures par poste.',
      badge: null,
    },
    {
      href: '/admin/parametres',
      icon: Settings,
      label: 'Paramètres',
      description: 'Informations entreprise, couleur de marque et emails automatiques.',
      badge: null,
    },
  ];

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#F0F0F0]" />
          <div className="mt-4 h-9 w-72 animate-pulse rounded-xl bg-[#F0F0F0]" />
          <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded-full bg-[#F0F0F0]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-[#F0F0F0]" />
              <div className="mt-4 h-8 w-14 animate-pulse rounded-lg bg-[#F0F0F0]" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-[#F0F0F0]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (status.is_new) {
    return (
      <section className="space-y-5">
        <WelcomeToast shouldShow={showWelcomeToast} onConsumed={removeWelcomeQuery} />
        <OnboardingBanner status={status} />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <WelcomeToast shouldShow={showWelcomeToast} onConsumed={removeWelcomeQuery} />

      {/* Pending alert */}
      {status.pending_applications_count > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2600C]/15">
              <Users size={15} className="text-[#F2600C]" />
            </div>
            <p className="text-sm font-semibold text-[#0E0E10]">
              <span className="text-[#F2600C]">{status.pending_applications_count} candidature{status.pending_applications_count > 1 ? 's' : ''}</span> en attente de traitement
            </p>
          </div>
          <Link
            href="/admin/candidatures?status=pending"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#F2600C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D44F08]"
          >
            Traiter maintenant
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Hero stats card */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
        <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Tableau de bord</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[#0E0E10] sm:text-3xl">
            Pilotage du recrutement
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B7280]">
            Accédez rapidement à vos candidatures, gérez vos postes et personnalisez votre espace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border-t border-[#F0F0F0] bg-[#F0F0F0] sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="bg-white px-6 py-5 sm:px-8">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                <p className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-[#0E0E10]">{item.value}</p>
                <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{item.label}</p>
              </article>
            );
          })}
        </div>
      </div>

      {/* Plan section */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Abonnement</p>
            <h2 className="mt-1 text-lg font-bold text-[#0E0E10]">Plan et limites</h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
            planStatus.is_pro
              ? 'bg-[#F2600C] text-white'
              : 'bg-[#F5F5F5] text-[#6B7280]'
          }`}>
            {planStatus.is_pro ? '⚡ Plan Pro' : 'Plan Starter'}
          </span>
        </div>

        {planLoading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-[#F0F0F0]" />
            <div className="h-24 animate-pulse rounded-xl bg-[#F0F0F0]" />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Postes actifs',
                current: planStatus.jobs.current,
                limit: planStatus.jobs.limit,
                remaining: planStatus.jobs.remaining,
                unlimited: planStatus.jobs.limit === null,
              },
              {
                label: 'Candidatures ce mois',
                current: planStatus.applications.current_month,
                limit: planStatus.applications.limit,
                remaining: planStatus.applications.remaining,
                unlimited: planStatus.applications.limit === null,
              },
            ].map((item) => {
              const pct = item.unlimited ? 100 : item.limit ? Math.min(100, Math.round((item.current / item.limit) * 100)) : 0;
              const barColor = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-[#F2600C]';
              return (
                <article key={item.label} className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{item.label}</p>
                    <p className="text-[13px] font-bold text-[#0E0E10]">
                      {item.unlimited ? '∞' : `${item.current}${item.limit !== null ? ` / ${item.limit}` : ''}`}
                    </p>
                  </div>
                  {!item.unlimited && item.limit !== null && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  <p className="mt-2 text-[12px] text-[#9CA3AF]">
                    {item.unlimited
                      ? 'Illimité avec le plan Pro'
                      : item.remaining !== null
                        ? `${item.remaining} restant${item.remaining !== 1 ? 's' : ''}`
                        : ''}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {!planStatus.is_pro && (
          <Link
            href="/admin/upgrade"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F2600C] transition hover:text-[#D44F08]"
          >
            Passer au plan Pro →
          </Link>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition hover:border-[#F2600C]/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4EE] text-[#F2600C] transition group-hover:bg-[#FFD5C2]">
                  <Icon size={18} />
                </div>
                <ChevronRight size={16} className="mt-1 text-[#D1D5DB] transition group-hover:translate-x-0.5 group-hover:text-[#F2600C]" />
              </div>
              <p className="mt-4 text-[15px] font-bold text-[#0E0E10]">{item.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">{item.description}</p>
              {item.badge && (
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-[#FFF4EE] px-2.5 py-0.5 text-[11px] font-bold text-[#F2600C]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
