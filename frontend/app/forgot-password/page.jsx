'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';

/**
 * Ask for a password reset link by email.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      await Alert.fire({
        icon: 'error',
        title: 'Email invalide',
        text: 'Veuillez entrer une adresse email valide.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setIsSent(true);
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Erreur',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Mot de passe oublié</h1>

        {isSent ? (
          <p className="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
            Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient d&apos;être envoyé.
            Il est valable 60 minutes. Pensez à vérifier vos spams.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Entrez l&apos;email de votre entreprise : nous vous enverrons un lien pour choisir un nouveau mot de passe.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="company@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">← Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
