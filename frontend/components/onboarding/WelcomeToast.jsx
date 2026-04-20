'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getCompany } from '@/lib/auth';

/**
 * Show onboarding welcome modal once per company when welcome mode is enabled.
 */
export default function WelcomeToast({ shouldShow, onConsumed }) {
  const router = useRouter();
  const displayedRef = useRef(false);

  useEffect(() => {
    if (!shouldShow || displayedRef.current) {
      return;
    }

    const company = getCompany();
    const companyId = company?.id || 'unknown';
    const storageKey = `welcome_shown_${companyId}`;
    const alreadyShown = localStorage.getItem(storageKey) === 'true';

    // Remove query mode from URL immediately without reloading.
    onConsumed();

    if (alreadyShown) {
      return;
    }

    displayedRef.current = true;

    void Swal.fire({
      title: '👋 Bienvenue !',
      text: 'Votre compte a bien été créé. Commencez par créer votre premier poste pour recevoir des candidatures.',
      icon: 'success',
      confirmButtonText: 'Créer mon premier poste',
      showCancelButton: true,
      cancelButtonText: 'Explorer d\'abord',
      confirmButtonColor: '#6366F1',
    }).then((result) => {
      localStorage.setItem(storageKey, 'true');

      if (result.isConfirmed) {
        router.push('/admin/postes');
      }
    });
  }, [onConsumed, router, shouldShow]);

  return null;
}
