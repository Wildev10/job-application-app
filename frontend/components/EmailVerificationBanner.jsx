'use client';

import { useEffect, useState } from 'react';
import { MailWarning } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { getCompany, saveCompany } from '@/lib/auth';

/**
 * Remind the company to confirm its email, without blocking the dashboard.
 */
export default function EmailVerificationBanner() {
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('impersonate_token')) {
      return;
    }

    const cached = getCompany();
    if (cached && !cached.email_verified_at) {
      setIsUnverified(true);
    }

    apiFetch('/auth/me', { method: 'GET' })
      .then((payload) => {
        if (payload?.company) {
          saveCompany(payload.company);
          setIsUnverified(!payload.company.email_verified_at);
        }
      })
      .catch(() => {});
  }, []);

  const handleResend = async () => {
    setIsSending(true);

    try {
      const payload = await apiFetch('/auth/resend-verification', { method: 'POST' });
      await Alert.fire({
        icon: 'success',
        title: 'Email envoyé',
        text: payload?.message || 'Vérifiez votre boîte de réception (et vos spams).',
        confirmButtonColor: '#F2600C',
      });
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Envoi impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isUnverified) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <MailWarning size={18} className="shrink-0" />
      <span className="flex-1">Confirmez votre adresse email pour sécuriser votre compte.</span>
      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={isSending}
        className="rounded-md border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
      >
        {isSending ? 'Envoi...' : "Renvoyer l'email"}
      </button>
    </div>
  );
}
