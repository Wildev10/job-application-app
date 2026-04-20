'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
// FIX-CONTRAST: lisibilite corrigee

/**
 * Render company login form.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      await Alert.fire({
        icon: 'error',
        title: 'Champs obligatoires',
        text: 'Veuillez renseigner l\'email et le mot de passe.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      const result = await login(email.trim(), password);

      if (!result.success) {
        await Alert.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Identifiants incorrects',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      await Alert.fire({
        icon: 'success',
        title: 'Connexion réussie !',
        confirmButtonColor: '#0d9488',
      });

      // Route new companies through onboarding welcome mode right after login.
      try {
        const onboardingStatus = await apiFetch('/company/onboarding-status', { method: 'GET' });
        router.push(onboardingStatus?.is_new ? '/admin?welcome=true' : '/admin');
      } catch {
        router.push('/admin');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50 lg:grid-cols-2">
      <section className="hidden border-r border-teal-100 bg-teal-50 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.08em] text-teal-800">
            <Sparkles size={14} />
            Espace entreprise
          </div>

          <div>
            <h1 className="text-5xl font-black tracking-[-0.03em] text-slate-900">Pilotez votre recrutement avec clarté.</h1>
            <p className="mt-4 max-w-md text-base text-slate-600">
              Centralisez vos candidatures, suivez chaque statut et gagnez du temps sur les tâches répétitives.
            </p>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-100 p-4 text-sm text-teal-900">
            <p className="flex items-center gap-2 font-semibold text-teal-900"><ShieldCheck size={16} /> Connexion sécurisée</p>
            <p className="mt-2 text-teal-800">Vos accès entreprise sont protégés et vos données restent confidentielles.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <h2 className="text-2xl font-extrabold text-slate-900">Connexion entreprise</h2>
          <p className="mt-2 text-sm text-slate-600">Accédez à votre espace de gestion des candidatures.</p>

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

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-teal-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
