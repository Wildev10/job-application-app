'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Infinity,
  Mail,
  Target,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PlanLimitBar from '@/components/PlanLimitBar';
import { usePlanStatus } from '@/hooks/usePlanStatus';

const PRO_FEATURES = [
  {
    icon: Infinity,
    title: 'Postes illimités',
    description: 'Publiez autant d\'offres que nécessaire sans plafond.',
  },
  {
    icon: Infinity,
    title: 'Candidatures illimitées',
    description: 'Aucune limite mensuelle sur les candidatures reçues.',
  },
  {
    icon: Download,
    title: 'Export CSV',
    description: 'Exportez vos données en un clic pour vos analyses.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques 90 jours',
    description: 'Suivez vos performances sur un historique étendu.',
  },
  {
    icon: Mail,
    title: 'Emails automatiques avancés',
    description: 'Automatisez des communications plus fines avec vos candidats.',
  },
  {
    icon: Target,
    title: 'Support prioritaire',
    description: 'Bénéficiez d\'une prise en charge accélérée.',
  },
];

/**
 * Display the commercial upgrade page for Starter companies.
 */
export default function AdminUpgradePage() {
  const { planLimits, isStarter } = usePlanStatus();

  const handleStartPayment = async () => {
    // Step 3 checkout integration hook: trigger FedaPay flow when SDK is mounted.
    if (typeof window !== 'undefined' && window.FedaPay && typeof window.FedaPay.init === 'function') {
      window.FedaPay.init({
        amount: 15000,
        currency: { iso: 'XOF' },
        description: 'Abonnement Plan Pro - Vaybe Recrutement',
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent('vaybe:upgrade-pro-checkout', {
        detail: {
          provider: 'fedapay',
          amount: 15000,
          currency: 'XOF',
          plan: 'pro',
        },
      }),
    );

    await Swal.fire({
      icon: 'info',
      title: 'Paiement en préparation',
      text: 'Le checkout FedaPay sera disponible juste après l\'étape d\'intégration paiement.',
      confirmButtonColor: '#0D9488',
    });
  };

  return (
    <section className="relative min-h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 p-4 sm:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />

      <div className="relative space-y-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
          <ArrowLeft size={16} />
          <span>Retour</span>
        </Link>

        <header
          className="space-y-5 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8"
          style={{ animation: 'upgradeReveal 280ms ease-out both' }}
        >
          <span className="inline-flex rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
            ✦ Plan Pro
          </span>
          <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-900 sm:text-5xl">
            Débloquez tout le potentiel de Vaybe Recrutement
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Rejoignez les entreprises qui recrutent mieux et plus vite.
          </p>
        </header>

        {isStarter && (
          <div
            className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-6 shadow-sm"
            style={{ animation: 'upgradeReveal 340ms ease-out both' }}
          >
            <h2 className="text-lg font-semibold text-amber-900">⚠️ Votre utilisation actuelle</h2>
            <PlanLimitBar
              label="Postes actifs"
              current={planLimits?.jobs?.current || 0}
              limit={planLimits?.jobs?.limit || 2}
            />
            <PlanLimitBar
              label="Candidatures ce mois"
              current={planLimits?.applications?.current_month || 0}
              limit={planLimits?.applications?.limit || 50}
            />
          </div>
        )}

        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          style={{ animation: 'upgradeReveal 420ms ease-out both' }}
        >
          {PRO_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group flex items-start gap-3 rounded-xl border border-teal-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="rounded-lg bg-teal-50 p-2 text-teal-600 transition group-hover:bg-teal-100">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-teal-200 bg-white p-8 shadow-xl shadow-teal-500/10 sm:max-w-md sm:mx-auto"
          style={{ animation: 'upgradeReveal 500ms ease-out both' }}
        >
          <div className="pointer-events-none absolute -top-24 right-0 h-40 w-40 rounded-full bg-teal-100 blur-2xl" />
          <div className="relative text-center">
            <p className="text-xl font-bold text-slate-900">Plan Pro</p>
            <p className="mt-2 text-4xl font-black text-teal-600">
              15 000 FCFA <span className="text-lg font-medium text-slate-400">/ mois</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">Soit 500 FCFA par jour</p>
          </div>

          <div className="my-5 h-px bg-slate-200" />

          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Postes illimités</li>
            <li>✓ Candidatures illimitées</li>
            <li>✓ Export CSV</li>
            <li>✓ Statistiques 90 jours</li>
            <li>✓ Emails automatiques avancés</li>
            <li>✓ Support prioritaire</li>
          </ul>

          <button
            type="button"
            onClick={() => void handleStartPayment()}
            className="mt-6 w-full rounded-xl bg-teal-600 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700"
          >
            Passer au Pro — Payer avec Mobile Money
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">🔒 Paiement sécurisé via FedaPay</p>
          <p className="mt-1 text-center text-xs text-slate-400">Annulation possible à tout moment</p>
        </div>

        <style jsx>{`
          @keyframes upgradeReveal {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
