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
  payments = [],
  onClose,
  onSuspend,
  onActivate,
  onImpersonate,
  onUpdatePlan,
}) {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [planExpiresAt, setPlanExpiresAt] = useState('');

  const company = data?.company || {};
  const stats = data?.applications_stats || {};
  const recent = Array.isArray(data?.recent_applications) ? data.recent_applications : [];
  const history = Array.isArray(data?.activity_last_30_days) ? data.activity_last_30_days : [];

  if (!open || !data) {
    return null;
  }

  const statusBadgeClass = (status) => {
    if (status === 'approved') return 'bg-emerald-500/20 text-emerald-300';
    if (status === 'pending') return 'bg-amber-500/20 text-amber-300';
    if (status === 'canceled') return 'bg-slate-700 text-slate-300';
    if (status === 'declined') return 'bg-red-500/20 text-red-300';
    return 'bg-slate-700 text-slate-300';
  };

  const statusLabel = (status) => {
    if (status === 'approved') return 'Confirme ✓';
    if (status === 'pending') return 'En attente...';
    if (status === 'canceled') return 'Annule';
    if (status === 'declined') return 'Refuse';
    return 'Inconnu';
  };

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

        <div className="mt-6 flex gap-2 border-b border-gray-700 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            Détails
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              activeTab === 'payments'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            Paiements
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
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
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Historique des paiements</p>
            {payments.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Aucun paiement enregistré.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700 text-sm">
                  <thead className="bg-gray-800/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Montant</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Methode</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Periode</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {payments.map((payment) => {
                      const paidDate = payment?.paid_at || payment?.created_at;
                      const displayDate = paidDate
                        ? new Date(paidDate).toLocaleDateString('fr-FR')
                        : '-';
                      const start = payment?.period_start
                        ? new Date(payment.period_start).toLocaleDateString('fr-FR')
                        : null;
                      const end = payment?.period_end
                        ? new Date(payment.period_end).toLocaleDateString('fr-FR')
                        : null;

                      return (
                        <tr key={payment.id}>
                          <td className="px-3 py-2 text-gray-200">{displayDate}</td>
                          <td className="px-3 py-2 text-gray-100">{payment.amount_formatted || '-'}</td>
                          <td className="px-3 py-2 text-gray-300">{payment.payment_method || 'Mobile Money'}</td>
                          <td className="px-3 py-2 text-gray-300">{start && end ? `${start} - ${end}` : '-'}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(payment.status)}`}>
                              {statusLabel(payment.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
