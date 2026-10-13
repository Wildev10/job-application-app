'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

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
  const [emailJustVerified, setEmailJustVerified] = useState(false);

  useEffect(() => {
    setEmailJustVerified(new URLSearchParams(window.location.search).get('verified') === '1');
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      await Alert.fire({
        icon: 'error',
        title: 'Champs obligatoires',
        text: 'Veuillez renseigner l\'email et le mot de passe.',
        confirmButtonColor: '#F2600C',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await Alert.fire({
        icon: 'error',
        title: 'Email invalide',
        text: 'Veuillez entrer une adresse email valide.',
        confirmButtonColor: '#F2600C',
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
        confirmButtonColor: '#F2600C',
        customClass: { popup: 'swal-custom-popup' },
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
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — dark ink */}
      <section className="hidden flex-col justify-between bg-[#0E0E10] p-12 lg:flex">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white/70">
          <Sparkles size={14} />
          Espace entreprise
        </div>

        <div>
          <h1 className="text-5xl font-black tracking-[-0.03em] text-white">
            Pilotez votre recrutement{' '}
            <span className="text-[#F2600C]">avec clarté.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-[#9CA3AF]">
            Centralisez vos candidatures, suivez chaque statut et gagnez du temps sur les tâches répétitives.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck size={16} className="text-[#F2600C]" />
            Connexion sécurisée
          </p>
          <p className="mt-2 text-[#9CA3AF]">Vos accès entreprise sont protégés et vos données restent confidentielles.</p>
        </div>
      </section>

      {/* Right panel — form */}
      <section className="flex items-center justify-center bg-[#FAFAFA] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-extrabold text-[#0E0E10]">Connexion entreprise</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Accédez à votre espace de gestion des candidatures.</p>

          {emailJustVerified ? (
            <p className="mt-4 rounded-xl bg-[#FFF4EE] p-3 text-sm font-medium text-[#F2600C]">
              ✅ Votre email est confirmé. Vous pouvez vous connecter.
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#374151]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                placeholder="company@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#374151]">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 pr-11 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9CA3AF] hover:text-[#F2600C]"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-sm font-medium text-[#F2600C] hover:text-[#D44F08]">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#F2600C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[#6B7280]">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-[#F2600C] hover:text-[#D44F08]">
              Créer un compte
            </Link>
          </p>
          <p className="mt-3 text-sm text-[#9CA3AF]">
            Vous êtes recruteur invité ?{' '}
            <Link href="/member/login" className="font-medium text-[#6B7280] hover:text-[#0E0E10]">
              Connexion recruteur →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
