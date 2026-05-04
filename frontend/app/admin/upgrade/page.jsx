'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Infinity,
  Mail,
  Smartphone,
  Target,
} from 'lucide-react';
import PlanLimitBar from '@/components/PlanLimitBar';
import { usePayment } from '@/hooks/usePayment';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { Alert } from '@/lib/sweetalert';

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
  const router = useRouter();
  const { planLimits, isStarter, refreshPlanLimits } = usePlanStatus();
  const {
    initiating,
    polling,
    paymentStatus,
    initiatePayment,
    startPolling,
  } = usePayment({ refreshPlanStatus: refreshPlanLimits });
  const [countdown, setCountdown] = useState(3);
  const [paymentParam] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get('payment');
  });

  const proPriceLabel = process.env.NEXT_PUBLIC_PLAN_PRO_PRICE_LABEL || '15 000 FCFA';
  const proPrice = Number(process.env.NEXT_PUBLIC_PLAN_PRO_PRICE || 15000);

  useEffect(() => {
    if (paymentParam === 'cancelled') {
      router.replace('/admin/upgrade');

      void Alert.fire({
        icon: 'info',
        title: 'Paiement annulé',
        text: 'Vous pouvez relancer le paiement à tout moment.',
        confirmButtonColor: '#0D9488',
      });

      return;
    }

    if (paymentParam === 'success') {
      router.replace('/admin/upgrade');

      if (typeof window !== 'undefined') {
        const pendingId = window.localStorage.getItem('pending_payment_id');
        if (pendingId) {
          startPolling(Number(pendingId));
        }
      }
    }
  }, [paymentParam, router, startPolling]);

  useEffect(() => {
    if (paymentStatus !== 'canceled' && paymentStatus !== 'declined') {
      return;
    }

    void Alert.fire({
      icon: 'error',
      title: 'Paiement non abouti',
      text: 'Votre paiement n\'a pas été finalisé. Vous pouvez réessayer.',
      showCancelButton: true,
      confirmButtonText: 'Réessayer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0D9488',
      cancelButtonColor: '#94A3B8',
    });
  }, [paymentStatus]);

  useEffect(() => {
    if (paymentStatus !== 'approved') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalId);
          router.push('/admin');
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [paymentStatus, router]);

  const isVerifyingAfterReturn = useMemo(() => paymentParam === 'success' || polling, [paymentParam, polling]);

  if (paymentStatus === 'approved') {
    return (
      <section className="min-h-full rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl text-teal-700">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-slate-900">🎉 Bienvenue dans le plan Pro !</h1>
          <p className="mt-4 max-w-xl text-slate-500">
            Votre paiement a été confirmé. Toutes vos fonctionnalités Pro sont maintenant actives.
          </p>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="mt-8 rounded-xl bg-teal-600 px-8 py-4 text-white transition hover:bg-teal-700"
          >
            Accéder à mon espace Pro →
          </button>
          <p className="mt-3 text-sm text-slate-500">Redirection automatique dans {countdown}s</p>
        </div>
      </section>
    );
  }

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

        {isVerifyingAfterReturn && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-6">
            <div className="flex items-center gap-3">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-300 border-t-teal-700" />
              <p className="font-semibold text-teal-700">Vérification du paiement...</p>
            </div>
            <p className="mt-2 text-sm text-teal-700">Nous vérifions votre paiement, merci de patienter...</p>
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
              {proPriceLabel} <span className="text-lg font-medium text-slate-400">/ mois</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">Soit {Math.round(proPrice / 30)} FCFA par jour</p>
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
            onClick={() => void initiatePayment()}
            disabled={initiating}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {initiating ? (
              <>
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                Connexion au service de paiement...
              </>
            ) : (
              <>
                <Smartphone size={18} />
                Payer {proPriceLabel} avec Mobile Money →
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">MTN Mobile Money</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">Moov Money</span>
          </div>

          <p className="mt-2 text-center text-xs text-slate-400">🔒 Paiement sécurisé FedaPay</p>
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
