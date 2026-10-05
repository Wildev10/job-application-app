'use client';

import { useRouter } from 'next/navigation';
import { X, Zap } from 'lucide-react';

const REASON_MESSAGES = {
  limite_jobs: 'Vous avez atteint la limite de 2 postes actifs sur votre plan Starter.',
  limite_candidatures: 'Vous avez atteint la limite de 50 candidatures ce mois-ci sur votre plan Starter.',
  export_csv: "L'export CSV est une fonctionnalité exclusive du plan Pro.",
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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0E0E10]/80 p-4 backdrop-blur-[2px]"
      style={{ animation: 'upgradeOverlayFade 180ms ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-2xl"
        style={{ animation: 'upgradePanelIn 240ms cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {/* Header */}
        <div className="relative bg-[#F2600C] px-6 py-7">
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

        <div className="space-y-6 px-6 py-6">
          <p className="text-sm leading-6 text-[#6B7280]">{message}</p>

          <div className="grid gap-3 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3">
              <p className="text-sm font-semibold text-[#9CA3AF]">Starter (actuel)</p>
              <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
                <li>✓ 2 postes</li>
                <li>✓ 50 cand./mois</li>
                <li className="opacity-40">✗ Export CSV</li>
                <li className="opacity-40">✗ Stats avancées</li>
                <li className="opacity-40">✗ Support prio.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] p-3">
              <p className="text-sm font-semibold text-[#F2600C]">Pro ✦</p>
              <ul className="mt-3 space-y-2 text-sm text-[#374151]">
                <li>✓ Postes illimités</li>
                <li>✓ Candidatures illimitées</li>
                <li>✓ Export CSV</li>
                <li>✓ Stats 90 jours</li>
                <li>✓ Support prioritaire</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-3xl font-black text-[#F2600C]">15 000 FCFA / mois</p>
            <p className="mt-1 text-sm text-[#9CA3AF]">Sans engagement • Annulez quand vous voulez</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-[#E5E5E5] bg-white px-6 py-5">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/admin/upgrade');
            }}
            className="w-full rounded-xl bg-[#F2600C] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#D44F08]"
          >
            Passer au Pro maintenant →
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-[#9CA3AF] transition hover:text-[#6B7280]"
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
