'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

/**
 * Render company registration form.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      await Swal.fire({
        icon: 'error',
        title: 'Champs obligatoires',
        text: 'Tous les champs sont requis.',
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

    if (password.length < 8) {
      await Swal.fire({
        icon: 'error',
        title: 'Mot de passe trop court',
        text: 'Le mot de passe doit contenir au moins 8 caractères.',
        confirmButtonColor: '#0f766e',
      });
      return;
    }

    if (password !== passwordConfirmation) {
      await Swal.fire({
        icon: 'error',
        title: 'Confirmation invalide',
        text: 'Les mots de passe ne correspondent pas.',
        confirmButtonColor: '#0f766e',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(name.trim(), email.trim(), password, passwordConfirmation);

      if (!result.success) {
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: result.message || 'Impossible de créer le compte.',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Compte créé avec succès !',
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
        <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Créer un compte entreprise</h1>
        <p className="mt-2 text-sm text-[#737373]">Configurez votre espace client en quelques secondes.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#525252]">Nom de l&apos;entreprise</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm text-[#0f0f0f] outline-none focus:border-[#0f766e]"
              placeholder="Orange Bénin"
            />
          </div>

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
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-[#525252]">Confirmer le mot de passe</label>
            <input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm text-[#0f0f0f] outline-none focus:border-[#0f766e]"
              placeholder="Répétez le mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#737373]">
          Déjà inscrit ?{' '}
          <Link href="/login" className="font-semibold text-[#0f766e] hover:text-[#115e59]">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}
