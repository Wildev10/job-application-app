'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/lib/sweetalert';
import { getCompany } from '@/lib/auth';
// FIX-CONTRAST: lisibilite corrigee

/**
 * Display onboarding checklist for newly created companies.
 */
export default function OnboardingBanner({ status }) {
  const router = useRouter();
  const company = getCompany();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const applyLink = company?.slug ? `${appUrl}/apply/${company.slug}` : '';

  const completedSteps = useMemo(() => {
    let total = 1;

    if (status?.has_jobs) {
      total += 1;
    }

    if (status?.has_applications) {
      total += 1;
    }

    return total;
  }, [status?.has_applications, status?.has_jobs]);

  const progress = Math.round((completedSteps / 3) * 100);

  if (status?.has_jobs) {
    return null;
  }

  const copyApplyLink = async () => {
    if (!applyLink) {
      return;
    }

    await navigator.clipboard.writeText(applyLink);

    await Alert.fire({
      icon: 'success',
      title: 'Lien copié !',
      text: 'Votre lien de candidature est prêt à être partagé.',
      confirmButtonColor: '#F2600C',
    });
  };

  return (
    <section className="rounded-xl border-2 border-[#FFD5C2] bg-gradient-to-br from-[#FFF4EE] to-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#F2600C]">Progression de l&apos;onboarding</p>
          <p className="text-sm font-medium text-[#D44F08]">Étape {completedSteps} sur 3 complétée</p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFD5C2]">
          <div
            className="h-full rounded-full bg-[#F2600C] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#111827]">🎉 Bienvenue sur Vaybe Recrutement !</h1>
        <p className="text-sm text-[#4b5563]">Suivez ces étapes pour recevoir vos premières candidatures</p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[#22A559]/30 bg-[#22A559]/10 p-4">
          <p className="text-sm text-gray-500 line-through">✅ Compte créé</p>
          <span className="rounded-full bg-[#22A559]/20 px-2.5 py-1 text-xs font-semibold text-[#22A559]">Complété</span>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-[#FFD5C2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {status?.has_jobs ? (
            <p className="text-sm text-gray-500 line-through">✅ Créer votre premier poste</p>
          ) : (
            <p className="text-sm font-semibold text-[#111827]">Créer votre premier poste</p>
          )}

          {status?.has_jobs ? (
            <span className="w-fit rounded-full bg-[#22A559]/20 px-2.5 py-1 text-xs font-semibold text-[#22A559]">Complété</span>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/admin/postes')}
              className="w-fit rounded-lg bg-[#F2600C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D44F08]"
            >
              Créer un poste →
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-[#FFD5C2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {status?.has_applications ? (
            <p className="text-sm text-gray-500 line-through">✅ Partager votre lien de candidature</p>
          ) : (
            <p className="text-sm font-semibold text-[#111827]">Partager votre lien de candidature</p>
          )}

          {!status?.has_jobs ? (
            <span className="text-sm text-[#9ca3af]">Disponible après création d&apos;un poste</span>
          ) : status?.has_applications ? (
            <span className="w-fit rounded-full bg-[#22A559]/20 px-2.5 py-1 text-xs font-semibold text-[#22A559]">Complété</span>
          ) : (
            <button
              type="button"
              onClick={() => void copyApplyLink()}
              className="w-fit rounded-lg border border-[#FFD5C2] bg-white px-4 py-2 text-sm font-semibold text-[#F2600C] transition hover:bg-[#FFF4EE]"
            >
              Copier mon lien
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
