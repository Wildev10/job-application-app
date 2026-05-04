'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

const STATUS_BADGES = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  canceled: 'bg-slate-100 text-slate-600',
  declined: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  approved: 'Confirme ✓',
  pending: 'En attente...',
  canceled: 'Annule',
  declined: 'Refuse',
};

/**
 * Display company payment history from the authenticated payments API.
 */
export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);

      try {
        const payload = await apiFetch('/payments/history', { method: 'GET' });
        setPayments(Array.isArray(payload) ? payload : []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    void loadPayments();
  }, []);

  const rows = useMemo(() => payments, [payments]);

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
      <h3 className="text-lg font-bold text-[#0f0f0f]">Historique des paiements</h3>

      {loading ? (
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-[#eef0f3]" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Aucun paiement enregistre</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Montant</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Methode</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Periode</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((payment) => {
                const status = payment?.status || 'pending';
                const badgeClass = STATUS_BADGES[status] || STATUS_BADGES.pending;
                const label = STATUS_LABELS[status] || STATUS_LABELS.pending;
                const paidDate = payment?.paid_at || payment?.created_at;
                const displayDate = paidDate
                  ? new Date(paidDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : '-';

                const start = payment?.period_start
                  ? new Date(payment.period_start).toLocaleDateString('fr-FR')
                  : null;
                const end = payment?.period_end
                  ? new Date(payment.period_end).toLocaleDateString('fr-FR')
                  : null;

                return (
                  <tr key={payment.id}>
                    <td className="px-3 py-2 text-slate-700">{displayDate}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{payment.amount_formatted || '-'}</td>
                    <td className="px-3 py-2 text-slate-600">{payment.payment_method || 'Mobile Money'}</td>
                    <td className="px-3 py-2 text-slate-600">{start && end ? `${start} - ${end}` : '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                        {label}
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
  );
}
