'use client';

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import BroadcastForm from '@/components/superadmin/BroadcastForm';
import { saFetch } from '@/lib/superAdminApi';

/**
 * Render super admin broadcast center with dynamic audience counts and history.
 */
export default function SuperAdminBroadcastPage() {
  const [counts, setCounts] = useState({ all: 0, pro: 0, starter: 0 });
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem('sa_broadcast_history');
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  const loadCounts = async () => {
    const pro = await saFetch('/superadmin/companies?plan=pro&per_page=1');
    const starter = await saFetch('/superadmin/companies?plan=starter&per_page=1');
    const active = await saFetch('/superadmin/companies?status=active&per_page=1');
    const inactive = await saFetch('/superadmin/companies?status=inactive&per_page=1');

    setCounts({
      all: (active.total || 0) + (inactive.total || 0),
      pro: pro.total || 0,
      starter: starter.total || 0,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCounts();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const tips = useMemo(() => ([
    'Rédigez un objet clair et orienté action.',
    'Privilégiez un message court avec une instruction finale.',
    'Annoncez les maintenances au moins 24h à l\'avance.',
    'Ajoutez un point de contact en cas de question.',
  ]), []);

  const handleSubmit = async ({ target, subject, message }) => {
    try {
      const response = await saFetch('/superadmin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ target, subject, message }),
      });

      const nextHistory = [
        {
          id: Date.now(),
          date: new Date().toLocaleString('fr-FR'),
          target,
          subject,
          sent_to: response.sent_to,
        },
        ...history,
      ].slice(0, 5);

      setHistory(nextHistory);
      localStorage.setItem('sa_broadcast_history', JSON.stringify(nextHistory));
      await loadCounts();

      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'success',
        title: 'Broadcast envoyé',
        text: response.message,
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Échec envoi',
        text: error instanceof Error ? error.message : 'Impossible d\'envoyer ce message.',
      });
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <BroadcastForm counts={counts} onSubmit={handleSubmit} />
      </div>

      <aside className="space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h3 className="text-lg font-bold text-white">💡 Bonnes pratiques</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          {tips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>

        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">5 derniers broadcasts</p>
          <div className="mt-3 space-y-3">
            {history.length === 0 && <p className="text-sm text-gray-500">Aucun envoi récent.</p>}
            {history.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
                <p className="text-sm font-semibold text-white">{item.subject}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
                <p className="mt-1 text-xs text-emerald-400">{item.sent_to} entreprises • cible {item.target}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
