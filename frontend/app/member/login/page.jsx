'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Users } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { saveMember, saveCompany, saveToken } from '@/lib/auth';

/**
 * Login page for company members (recruiters).
 */
export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      await Alert.fire({ icon: 'error', title: 'Champs obligatoires', confirmButtonColor: '#F2600C' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiFetch('/member/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      saveToken();
      saveCompany(result.company);
      saveMember(result.member);

      await Alert.fire({ icon: 'success', title: 'Connexion réussie !', confirmButtonColor: '#F2600C' });
      router.push('/admin');
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Identifiants incorrects',
        text: error instanceof Error ? error.message : 'Vérifiez vos identifiants.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4EE]">
          <Users size={22} className="text-[#F2600C]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0E0E10]">Connexion recruteur</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Accédez à l&apos;espace de votre entreprise.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#374151]">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#374151]">Mot de passe</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9CA3AF] hover:text-[#F2600C]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#F2600C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D44F08] disabled:opacity-60"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#6B7280]">
          Vous êtes le propriétaire ?{' '}
          <Link href="/login" className="font-semibold text-[#F2600C] hover:text-[#D44F08]">
            Connexion entreprise
          </Link>
        </p>
      </div>
    </main>
  );
}
