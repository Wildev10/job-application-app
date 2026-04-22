'use client';

import { useRouter } from 'next/navigation';
import { X, Zap } from 'lucide-react';

const REASON_MESSAGES = {
  limite_jobs: 'Vous avez atteint la limite de 2 postes actifs sur votre plan Starter.',
  limite_candidatures: 'Vous avez atteint la limite de 50 candidatures ce mois-ci sur votre plan Starter.',
  export_csv: 'L\'export CSV est une fonctionnalité exclusive du plan Pro.',
};

/**
 * Show a reusable modal encouraging Starter users to upgrade to Pro.
 */
export default function UpgradeModal({ isOpen, onClose, reason = 'default' }) {
  const router = useRouter();

  if (!isOpen) {
    return null;
  }

  const message = REASON_MESSAGES[reason] || 'Débloquez toutes les fonctionnalités avec le plan Pro.';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]"
      style={{ animation: 'upgradeOverlayFade 180ms ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-2xl"
        style={{ animation: 'upgradePanelIn 240ms cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-teal-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-emerald-200/45 blur-3xl" />

        <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/30"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-3 text-white shadow-sm">
              <Zap size={28} />
            </div>
            <h2 className="text-2xl font-black text-white">Passez au plan Pro</h2>
          </div>
        </div>

        <div className="relative space-y-6 px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">{message}</p>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3">
              <p className="text-sm font-semibold text-slate-500">Starter (actuel)</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>✓ 2 postes</li>
                <li>✓ 50 cand./mois</li>
                <li>✗ Export CSV</li>
                <li>✗ Stats avancées</li>
                <li>✗ Support prio.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">Pro ✦</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✓ Postes illimités</li>
                <li>✓ Candidatures illimitées</li>
                <li>✓ Export CSV</li>
                <li>✓ Stats 90 jours</li>
                <li>✓ Support prioritaire</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-3xl font-black text-teal-600">15 000 FCFA / mois</p>
            <p className="mt-1 text-sm text-slate-400">Sans engagement • Annulez quand vous voulez</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 bg-white/80 px-6 py-5">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/admin/upgrade');
            }}
            className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700"
          >
            Passer au Pro maintenant →
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-slate-400 transition hover:text-slate-600"
          >
            Pas maintenant
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes upgradeOverlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes upgradePanelIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
