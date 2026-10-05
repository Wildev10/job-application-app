'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

const STATUS_BADGES = {
  approved: 'bg-[#F0FDF4] text-[#22A559]',
  pending: 'bg-amber-50 text-amber-700',
  canceled: 'bg-[#F5F5F5] text-[#6B7280]',
  declined: 'bg-red-50 text-red-600',
};

const STATUS_LABELS = {
  approved: 'Confirmé ✓',
  pending: 'En attente...',
  canceled: 'Annulé',
  declined: 'Refusé',
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
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
      <h3 className="text-lg font-bold text-[#0E0E10]">Historique des paiements</h3>

      {loading ? (
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-[#F0F0F0]" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9CA3AF]">Aucun paiement enregistré</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F0F0F0] text-sm">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Montant</th>
                <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Méthode</th>
                <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Période</th>
                <th className="px-3 py-2 text-left font-semibold text-[#6B7280]">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5] bg-white">
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
                    <td className="px-3 py-2 text-[#374151]">{displayDate}</td>
                    <td className="px-3 py-2 font-semibold text-[#0E0E10]">{payment.amount_formatted || '-'}</td>
                    <td className="px-3 py-2 text-[#6B7280]">{payment.payment_method || 'Mobile Money'}</td>
                    <td className="px-3 py-2 text-[#6B7280]">{start && end ? `${start} - ${end}` : '-'}</td>
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
