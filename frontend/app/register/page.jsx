'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return 'Aucun mot de passe';
    if (passwordScore <= 1) return 'Faible';
    if (passwordScore <= 2) return 'Moyen';
    if (passwordScore === 3) return 'Bon';
    return 'Fort';
  }, [password, passwordScore]);

  const strengthColor = useMemo(() => {
    if (!password) return 'bg-[#E5E5E5]';
    if (passwordScore <= 1) return 'bg-red-500';
    if (passwordScore <= 2) return 'bg-amber-400';
    if (passwordScore === 3) return 'bg-[#F2600C]';
    return 'bg-[#22A559]';
  }, [password, passwordScore]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      await Alert.fire({
        icon: 'error',
        title: 'Champs obligatoires',
        text: 'Tous les champs sont requis.',
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

    if (password.length < 8) {
      await Alert.fire({
        icon: 'error',
        title: 'Mot de passe trop court',
        text: 'Le mot de passe doit contenir au moins 8 caractères.',
        confirmButtonColor: '#F2600C',
      });
      return;
    }

    if (password !== passwordConfirmation) {
      await Alert.fire({
        icon: 'error',
        title: 'Confirmation invalide',
        text: 'Les mots de passe ne correspondent pas.',
        confirmButtonColor: '#F2600C',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(name.trim(), email.trim(), password, passwordConfirmation);

      if (!result.success) {
        await Alert.fire({
          icon: 'error',
          title: 'Erreur',
          text: result.message || 'Impossible de créer le compte.',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      await Alert.fire({
        icon: 'success',
        title: 'Compte créé avec succès !',
        confirmButtonColor: '#F2600C',
      });

      router.push('/admin');
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
          Démarrage rapide
        </div>

        <div>
          <h1 className="text-5xl font-black tracking-[-0.03em] text-white">
            Créez votre espace{' '}
            <span className="text-[#F2600C]">recrutement.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-[#9CA3AF]">
            Personnalisez votre entreprise, publiez vos offres et centralisez toutes les candidatures.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <p className="font-semibold text-white">Inclus dès l&apos;inscription</p>
          <p className="mt-2 text-[#9CA3AF]">Formulaire public, suivi des statuts et emails automatiques candidats.</p>
        </div>
      </section>

      {/* Right panel — form */}
      <section className="flex items-center justify-center bg-[#FAFAFA] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-extrabold text-[#0E0E10]">Créer un compte entreprise</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Configurez votre espace client en quelques secondes.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#374151]">Nom de l&apos;entreprise</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                placeholder="Orange Benin"
              />
            </div>

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
                  placeholder="Minimum 8 caractères"
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

              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-[#E5E5E5]">
                  <div
                    className={`h-1.5 rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(passwordScore / 4) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">Force du mot de passe : {passwordStrengthLabel}</p>
              </div>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-[#374151]">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 pr-11 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                  placeholder="Répétez le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9CA3AF] hover:text-[#F2600C]"
                  aria-label={showPasswordConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#F2600C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[#6B7280]">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-semibold text-[#F2600C] hover:text-[#D44F08]">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
