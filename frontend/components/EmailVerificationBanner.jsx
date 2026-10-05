'use client';

import { useEffect, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { getCompany, saveCompany } from '@/lib/auth';

/**
 * Remind the company to confirm its email, without blocking the dashboard.
 */
export default function EmailVerificationBanner() {
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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

  if (!isUnverified || isDismissed) {
    return null;
  }

  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2600C]/15">
        <Mail size={15} className="text-[#F2600C]" />
      </div>
      <p className="flex-1 text-[13px] font-medium text-[#0E0E10]">
        Confirmez votre adresse email pour sécuriser votre compte.
      </p>
      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={isSending}
        className="shrink-0 rounded-lg bg-[#F2600C] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#D44F08] disabled:opacity-60"
      >
        {isSending ? 'Envoi...' : 'Renvoyer'}
      </button>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="shrink-0 rounded-md p-1 text-[#9CA3AF] transition hover:text-[#0E0E10]"
        aria-label="Fermer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
