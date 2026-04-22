'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';
import ActivityChart from '@/components/superadmin/ActivityChart';
import PlanBadge from '@/components/PlanBadge';

/**
 * Display full company details and actions inside a dark modal.
 */
export default function CompanyDetailModal({
  open,
  data,
  onClose,
  onSuspend,
  onActivate,
  onImpersonate,
  onUpdatePlan,
}) {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [planExpiresAt, setPlanExpiresAt] = useState('');

  const company = data?.company || {};
  const stats = data?.applications_stats || {};
  const recent = Array.isArray(data?.recent_applications) ? data.recent_applications : [];
  const history = Array.isArray(data?.activity_last_30_days) ? data.activity_last_30_days : [];

  if (!open || !data) {
    return null;
  }

  const handleConfirmPlan = async () => {
    const result = await Swal.fire({
      background: '#111827',
      color: '#F9FAFB',
      icon: 'question',
      title: 'Confirmer le changement de plan ? ',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0D9488',
      cancelButtonColor: '#374151',
    });

    if (!result.isConfirmed) {
      return;
    }

    await onUpdatePlan(company, {
      plan: selectedPlan,
      plan_expires_at: selectedPlan === 'pro' ? planExpiresAt || null : null,
    });

    setShowPlanForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Entreprise</p>
            <h3 className="mt-1 text-xl font-bold text-white">{company.name}</h3>
            <p className="text-sm text-gray-400">{company.email}</p>
            <div className="mt-2">
              <PlanBadge plan={company.plan === 'pro' ? 'pro' : 'starter'} size="sm" />
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total candidatures</p>
            <p className="mt-1 text-lg font-semibold text-white">{stats.total || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Cette semaine</p>
            <p className="mt-1 text-lg font-semibold text-white">{stats.this_week || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Ce mois</p>
            <p className="mt-1 text-lg font-semibold text-white">{stats.this_month || 0}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Historique activité (30j)</p>
          <div className="mt-3">
            <ActivityChart data={history} height={180} />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Dernières candidatures</p>
          <div className="mt-3 space-y-3">
            {recent.length === 0 && <p className="text-sm text-gray-500">Aucune candidature récente.</p>}
            {recent.map((application) => (
              <div key={application.id} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                <p className="text-sm font-semibold text-white">{application.nom}</p>
                <p className="text-xs text-gray-400">{application.email} • {application.job?.title || 'Poste non renseigné'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {company.is_suspended ? (
            <button
              type="button"
              onClick={() => onActivate(company)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-400"
            >
              Activer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSuspend(company)}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Suspendre
            </button>
          )}

          <button
            type="button"
            onClick={() => onImpersonate(company)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
          >
            Se connecter en tant que cette entreprise
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPlanForm((value) => {
                const nextOpen = !value;

                if (nextOpen) {
                  setSelectedPlan(company.plan === 'pro' ? 'pro' : 'starter');
                  setPlanExpiresAt('');
                }

                return nextOpen;
              });
            }}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
          >
            Changer le plan
          </button>
        </div>

        {showPlanForm && (
          <div className="mt-4 space-y-3 rounded-lg border border-teal-500/30 bg-teal-500/10 p-4">
            <p className="text-sm font-semibold text-teal-300">Mise à jour du plan</p>

            <select
              value={selectedPlan}
              onChange={(event) => setSelectedPlan(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>

            {selectedPlan === 'pro' && (
              <input
                type="date"
                value={planExpiresAt}
                onChange={(event) => setPlanExpiresAt(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              />
            )}

            <button
              type="button"
              onClick={() => void handleConfirmPlan()}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Confirmer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
