'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';

/**
 * Choose a new password from the link received by email.
 */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 8) {
      await Alert.fire({ icon: 'error', title: 'Mot de passe trop court', text: 'Minimum 8 caractères.', confirmButtonColor: '#0d9488' });
      return;
    }

    if (password !== confirmation) {
      await Alert.fire({ icon: 'error', title: 'Confirmation différente', text: 'Les deux mots de passe ne correspondent pas.', confirmButtonColor: '#0d9488' });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, password, password_confirmation: confirmation }),
      });

      await Alert.fire({
        icon: 'success',
        title: 'Mot de passe mis à jour',
        text: 'Vous pouvez maintenant vous connecter.',
        confirmButtonColor: '#0d9488',
      });
      router.push('/login');
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Réinitialisation impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
        Ce lien est incomplet. <Link href="/forgot-password" className="font-semibold underline">Demandez-en un nouveau</Link>.
      </p>
    );
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30';

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
        <input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} autoComplete="new-password" />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Nouveau mot de passe</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-5 text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">← Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
