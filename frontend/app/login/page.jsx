'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

/**
 * Render company login form.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Champs obligatoires',
        text: 'Veuillez renseigner l\'email et le mot de passe.',
        confirmButtonColor: '#0f766e',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await Swal.fire({
        icon: 'error',
        title: 'Email invalide',
        text: 'Veuillez entrer une adresse email valide.',
        confirmButtonColor: '#0f766e',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Identifiants incorrects',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Connexion réussie !',
        confirmButtonColor: '#16a34a',
      });

      router.push('/admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#fafaf9] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Connexion entreprise</h1>
        <p className="mt-2 text-sm text-[#737373]">Accédez à votre espace de gestion des candidatures.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#525252]">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm text-[#0f0f0f] outline-none focus:border-[#0f766e]"
              placeholder="company@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#525252]">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm text-[#0f0f0f] outline-none focus:border-[#0f766e]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#737373]">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold text-[#0f766e] hover:text-[#115e59]">
            Créer un compte
          </Link>
        </p>
      </section>
    </main>
  );
}
