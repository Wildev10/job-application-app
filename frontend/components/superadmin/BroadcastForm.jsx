'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

/**
 * Render super admin broadcast form with dark preview and confirmation flow.
 */
export default function BroadcastForm({ counts, onSubmit }) {
  const [target, setTarget] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const recipientCount = counts[target] || 0;

  const canSubmit = useMemo(() => {
    return Boolean(subject.trim()) && Boolean(message.trim()) && recipientCount > 0;
  }, [subject, message, recipientCount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Confirmer l\'envoi',
      text: `Vous allez envoyer cet email à ${recipientCount} entreprises. Cette action est irréversible.`,
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      background: '#111827',
      color: '#F9FAFB',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#374151',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setSending(true);
    try {
      await onSubmit({ target, subject, message });
      setSubject('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
      <h2 className="text-lg font-bold text-white">Envoyer un message</h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs uppercase tracking-widest text-gray-400">Destinataires</label>
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes les entreprises</option>
            <option value="pro">Entreprises Pro</option>
            <option value="starter">Entreprises Starter</option>
          </select>
        </div>

        <p className="text-sm font-semibold text-emerald-400">
          Ce message sera envoyé à {recipientCount} entreprises
        </p>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-400">Sujet</label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500"
            placeholder="Maintenance planifiée de la plateforme"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-400">Message</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={8}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500"
            placeholder="Décrivez le message adressé aux entreprises..."
          />
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Aperçu email</p>
          <p className="mt-3 text-sm font-semibold text-white">{subject || 'Sujet du message'}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-gray-400">{message || 'Le contenu du message apparaitra ici.'}</p>
          <p className="mt-4 text-xs text-gray-500">Message de l&apos;équipe Vaybe</p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || sending}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? 'Envoi en cours...' : `Envoyer à ${recipientCount} entreprises`}
        </button>
      </form>
    </div>
  );
}
