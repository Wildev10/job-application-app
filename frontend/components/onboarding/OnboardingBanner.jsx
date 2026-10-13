'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, Circle, Copy, Rocket } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { getCompany } from '@/lib/auth';

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
    if (status?.has_jobs) total += 1;
    if (status?.has_applications) total += 1;
    return total;
  }, [status?.has_applications, status?.has_jobs]);

  const progress = Math.round((completedSteps / 3) * 100);

  if (status?.has_jobs) {
    return null;
  }

  const copyApplyLink = async () => {
    if (!applyLink) return;
    await navigator.clipboard.writeText(applyLink);
    await Alert.fire({
      icon: 'success',
      title: 'Lien copié !',
      text: 'Votre lien de candidature est prêt à être partagé.',
      confirmButtonColor: '#F2600C',
    });
  };

  const steps = [
    {
      number: 1,
      label: 'Créer votre compte',
      done: true,
      description: 'Votre espace entreprise est actif.',
    },
    {
      number: 2,
      label: 'Publier votre premier poste',
      done: !!status?.has_jobs,
      description: 'Décrivez le poste et les attentes.',
      action: () => router.push('/admin/postes'),
      actionLabel: 'Créer un poste',
    },
    {
      number: 3,
      label: 'Partager votre lien de candidature',
      done: !!status?.has_applications,
      description: 'Recevez vos premières candidatures.',
      action: () => void copyApplyLink(),
      actionLabel: 'Copier le lien',
      locked: !status?.has_jobs,
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#FFD5C2] bg-white shadow-sm">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-[#0E0E10] px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F2600C]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-[#F2600C]/8 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F2600C]/15 px-3 py-1">
              <Rocket size={13} className="text-[#F2600C]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F2600C]">Démarrage</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
              Bienvenue sur Vaybe&nbsp;!
            </h1>
            <p className="mt-1.5 text-sm text-[#9CA3AF]">
              3 étapes pour recevoir vos premières candidatures.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[13px] font-semibold text-[#F2600C]">{completedSteps}/3</p>
            <p className="text-[11px] text-[#6B7280]">complétées</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#F2600C] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-[#F5F5F5] px-6 sm:px-8">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`flex items-center gap-4 py-5 ${step.locked ? 'opacity-40' : ''}`}
          >
            {/* Step indicator */}
            <div className="shrink-0">
              {step.done ? (
                <CheckCircle2 size={28} className="text-[#22A559]" strokeWidth={2} />
              ) : (
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                  !step.locked
                    ? 'border-[#F2600C] bg-[#FFF4EE] text-[#F2600C]'
                    : 'border-[#E5E5E5] bg-[#FAFAFA] text-[#9CA3AF]'
                }`}>
                  <span className="text-[12px] font-bold">{step.number}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-semibold ${step.done ? 'text-[#9CA3AF] line-through' : 'text-[#0E0E10]'}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{step.description}</p>
            </div>

            {/* Action */}
            {step.done ? (
              <span className="shrink-0 rounded-full bg-[#22A559]/12 px-3 py-1 text-[11px] font-bold text-[#22A559]">
                ✓ Fait
              </span>
            ) : !step.locked && step.action ? (
              <button
                type="button"
                onClick={step.action}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#F2600C] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#D44F08] hover:shadow-md"
              >
                {step.number === 2 && <Briefcase size={13} />}
                {step.number === 3 && <Copy size={13} />}
                {step.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
