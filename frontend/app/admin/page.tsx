"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
    if (typeof window === 'undefined') {
      return false;
    }

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

  const stats = useMemo(() => {
    return [
      { label: 'Postes publiés', value: status.jobs_count },
      { label: 'Postes ouverts', value: status.open_jobs_count },
      { label: 'Candidatures reçues', value: status.applications_count },
    ];
  }, [status.applications_count, status.jobs_count, status.open_jobs_count]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-7">
          <div className="h-4 w-28 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-4 h-10 w-80 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[#F0F0F0]" />
          <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-[#F0F0F0]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-[#F0F0F0]" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-[#F0F0F0]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (status.is_new) {
    return (
      <section className="space-y-6">
        <WelcomeToast shouldShow={showWelcomeToast} onConsumed={removeWelcomeQuery} />
        <OnboardingBanner status={status} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <WelcomeToast shouldShow={showWelcomeToast} onConsumed={removeWelcomeQuery} />

      {status.pending_applications_count > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#F2600C]">
            {status.pending_applications_count} candidature(s) en attente de traitement
          </p>
          <Link
            href="/admin/candidatures?status=pending"
            className="w-fit rounded-md bg-[#F2600C] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#D44F08]"
          >
            Voir maintenant
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0E0E10] sm:text-4xl">
            Pilotage du recrutement
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
            Accédez rapidement aux candidatures, mettez à jour les statuts et personnalisez les
            informations de votre entreprise.
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{item.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-[#0E0E10]">{item.value}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#0E0E10]">Plan et limites</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${planStatus.is_pro ? 'bg-[#FFF4EE] text-[#F2600C]' : 'bg-[#F5F5F5] text-[#6B7280]'}`}>
            {planStatus.is_pro ? 'Plan Pro' : 'Plan Starter'}
          </span>
        </div>

        {planLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-lg bg-[#F0F0F0]" />
        ) : (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <article className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">Postes actifs</p>
                <p className="mt-2 text-2xl font-extrabold text-[#0E0E10]">{planStatus.jobs.current}{planStatus.jobs.limit !== null ? ` / ${planStatus.jobs.limit}` : ''}</p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  {planStatus.jobs.remaining !== null
                    ? `${planStatus.jobs.remaining} poste(s) restant(s)`
                    : 'Postes illimités'}
                </p>
              </article>

              <article className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">Candidatures mensuelles</p>
                <p className="mt-2 text-2xl font-extrabold text-[#0E0E10]">
                  {planStatus.applications.current_month}{planStatus.applications.limit !== null ? ` / ${planStatus.applications.limit}` : ''}
                </p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  {planStatus.applications.remaining !== null
                    ? `${planStatus.applications.remaining} candidature(s) restante(s) ce mois-ci`
                    : 'Candidatures illimitées'}
                </p>
              </article>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 font-semibold ${planStatus.features.export_csv ? 'bg-[#FFF4EE] text-[#F2600C]' : 'bg-[#F5F5F5] text-[#9CA3AF]'}`}>
                Export CSV {planStatus.features.export_csv ? 'activé' : 'désactivé'}
              </span>
              <span className={`rounded-full px-2.5 py-1 font-semibold ${planStatus.features.advanced_stats ? 'bg-[#FFF4EE] text-[#F2600C]' : 'bg-[#F5F5F5] text-[#9CA3AF]'}`}>
                Stats avancées {planStatus.features.advanced_stats ? 'activées' : 'désactivées'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/candidatures"
          className="rounded-xl border border-[#E5E5E5] bg-white p-5 transition hover:border-[#F2600C]/40 hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[#0E0E10]">Candidatures</p>
          <p className="mt-2 text-sm text-[#6B7280]">
            Consultez la liste complète des profils, appliquez des filtres et modifiez les statuts.
          </p>
        </Link>

        <Link
          href="/admin/parametres"
          className="rounded-xl border border-[#E5E5E5] bg-white p-5 transition hover:border-[#F2600C]/40 hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[#0E0E10]">Paramètres</p>
          <p className="mt-2 text-sm text-[#6B7280]">
            Modifiez les informations de votre entreprise et vérifiez vos emails automatiques.
          </p>
        </Link>
      </div>
    </section>
  );
}
