"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BriefcaseBusiness, Users, Clock, ChevronRight, ClipboardList, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import OnboardingBanner from '@/components/onboarding/OnboardingBanner';
import WelcomeToast from '@/components/onboarding/WelcomeToast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePlanStatus } from '@/hooks/usePlanStatus';

type LucideIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

function StatCard({ label, value, icon: Icon, color, loading }: {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'green';
  loading?: boolean;
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-500',
      border: 'border-blue-100',
      value: 'text-blue-700',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-[#F2600C]',
      border: 'border-orange-100',
      value: 'text-[#F2600C]',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-500',
      border: 'border-emerald-100',
      value: 'text-emerald-700',
    },
  };

  const c = colorMap[color];

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
        <div className="h-4 w-28 animate-pulse rounded bg-[#F0F0F0]" />
        <div className="mt-4 h-8 w-16 animate-pulse rounded bg-[#F0F0F0]" />
      </div>
    );
  }

  return (
    <article className="group rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{label}</p>
        <div className={`rounded-lg ${c.bg} ${c.border} border p-1.5`}>
          <Icon size={14} strokeWidth={2.25} className={c.icon} />
        </div>
      </div>
      <p className={`mt-3 text-3xl font-extrabold tracking-tight ${c.value}`}>
        {value ?? '—'}
      </p>
    </article>
  );
}

function PlanLimitItem({ label, current, limit, remaining }: {
  label: string;
  current: number;
  limit: number | null;
  remaining: number | null;
}) {
  const pct = limit !== null && limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : null;
  const isWarning = pct !== null && pct >= 80;
  const isFull = pct !== null && pct >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{label}</p>
        <p className="text-sm font-bold text-[#0E0E10]">
          {current}
          {limit !== null && <span className="text-[#9CA3AF] font-normal"> / {limit}</span>}
        </p>
      </div>
      {pct !== null ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-[#F2600C]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#F2600C]/30 to-[#F2600C]/10" />
        </div>
      )}
      <p className="text-xs text-[#9CA3AF]">
        {remaining !== null
          ? `${remaining} restant${remaining > 1 ? 's' : ''}`
          : 'Illimité'}
      </p>
    </div>
  );
}

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
    { label: 'Postes publiés', value: status.jobs_count, icon: BriefcaseBusiness, color: 'blue' as const },
    { label: 'Postes ouverts', value: status.open_jobs_count, icon: TrendingUp, color: 'green' as const },
    { label: 'Candidatures reçues', value: status.applications_count, icon: Users, color: 'orange' as const },
  ], [status.applications_count, status.jobs_count, status.open_jobs_count]);

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-7 shadow-sm">
          <div className="h-3.5 w-28 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-4 h-9 w-72 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-[#F0F0F0]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCard key={i} label="" value={undefined} icon={BriefcaseBusiness} color="blue" loading />
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

      {/* Pending applications alert */}
      {status.pending_applications_count > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#FFD5C2] bg-gradient-to-r from-[#FFF4EE] to-[#FFF9F5] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-[#F2600C]" />
            <p className="text-sm font-medium text-[#F2600C]">
              <span className="font-bold">{status.pending_applications_count}</span>{' '}
              candidature{status.pending_applications_count > 1 ? 's' : ''} en attente de traitement
            </p>
          </div>
          <Link
            href="/admin/candidatures?status=pending"
            className="flex w-fit items-center gap-1.5 rounded-lg bg-[#F2600C] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#D44F08] shadow-sm"
          >
            Traiter maintenant
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Header + stats */}
      <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7 shadow-sm">
        <header className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Dashboard</p>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#0E0E10] sm:text-3xl">
            Pilotage du recrutement
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
            Accédez rapidement aux candidatures, mettez à jour les statuts et personnalisez votre entreprise.
          </p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Plan & limits */}
      <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0E0E10]">Plan et limites</h2>
            <p className="mt-0.5 text-xs text-[#9CA3AF]">Suivi de votre consommation mensuelle</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${planStatus.is_pro ? 'bg-[#FFF4EE] text-[#F2600C]' : 'bg-[#F5F5F5] text-[#6B7280]'}`}>
            {planStatus.is_pro ? '✦ Plan Pro' : 'Plan Starter'}
          </span>
        </div>

        {planLoading ? (
          <div className="mt-5 space-y-4">
            <div className="h-12 animate-pulse rounded-lg bg-[#F0F0F0]" />
            <div className="h-12 animate-pulse rounded-lg bg-[#F0F0F0]" />
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <PlanLimitItem
                label="Postes actifs"
                current={planStatus.jobs.current}
                limit={planStatus.jobs.limit}
                remaining={planStatus.jobs.remaining}
              />
              <PlanLimitItem
                label="Candidatures ce mois"
                current={planStatus.applications.current_month}
                limit={planStatus.applications.limit}
                remaining={planStatus.applications.remaining}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <FeatureChip enabled={planStatus.features.export_csv} label="Export CSV" />
              <FeatureChip enabled={planStatus.features.advanced_stats} label="Stats avancées" />
            </div>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink
          href="/admin/candidatures"
          icon={ClipboardList}
          title="Candidatures"
          description="Consultez et gérez tous les profils. Filtrez par statut et mettez à jour les candidatures."
        />
        <QuickLink
          href="/admin/postes"
          icon={BriefcaseBusiness}
          title="Postes"
          description="Publiez de nouvelles offres, gérez les postes ouverts et archivez ceux pourvus."
        />
        <QuickLink
          href="/admin/parametres"
          icon={Settings}
          title="Paramètres"
          description="Modifiez les informations de votre entreprise et configurez les emails automatiques."
        />
        <QuickLink
          href="/admin/candidatures?status=pending"
          icon={Clock}
          title="En attente"
          description="Accédez directement aux candidatures en attente de traitement pour agir rapidement."
          accent
        />
      </div>
    </section>
  );
}

function FeatureChip({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled
          ? 'bg-[#FFF4EE] text-[#F2600C]'
          : 'bg-[#F5F5F5] text-[#9CA3AF]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-[#F2600C]' : 'bg-[#D1D5DB]'}`} />
      {label} {enabled ? 'activé' : 'désactivé'}
    </span>
  );
}

function QuickLink({ href, icon: Icon, title, description, accent = false }: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        accent
          ? 'border-[#FFD5C2] bg-gradient-to-br from-[#FFF9F5] to-white hover:border-[#F2600C]/40'
          : 'border-[#E8E8E8] bg-white hover:border-[#F2600C]/30'
      }`}
    >
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
        accent
          ? 'bg-[#FFF4EE] text-[#F2600C] group-hover:bg-[#F2600C] group-hover:text-white'
          : 'bg-[#F5F5F5] text-[#6B7280] group-hover:bg-[#F2600C] group-hover:text-white'
      }`}>
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0E0E10]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#9CA3AF]">{description}</p>
      </div>
      <ChevronRight
        size={16}
        className="mt-1 shrink-0 text-[#D1D5DB] transition-all group-hover:translate-x-0.5 group-hover:text-[#F2600C]"
      />
    </Link>
  );
}
