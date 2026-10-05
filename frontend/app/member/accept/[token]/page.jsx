'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { saveMember, saveCompany, saveToken } from '@/lib/auth';

/**
 * Page for accepting a team invite and creating a recruiter account.
 */
export default function AcceptInvitePage() {
  const { token } = useParams();
  const router = useRouter();

  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch(`/member/invite/${token}`, { method: 'GET' })
      .then((data) => setInvite(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Invitation invalide.'));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !password.trim()) {
      await Alert.fire({ icon: 'error', title: 'Champs obligatoires', confirmButtonColor: '#F2600C' });
      return;
    }
    if (password.length < 8) {
      await Alert.fire({ icon: 'error', title: 'Mot de passe trop court', text: 'Minimum 8 caractères.', confirmButtonColor: '#F2600C' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiFetch(`/member/accept/${token}`, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), password }),
      });

      saveToken();
      saveCompany(result.company);
      saveMember(result.member);

      await Alert.fire({
        icon: 'success',
        title: `Bienvenue ${result.member.name} !`,
        text: `Vous avez rejoint ${result.company.name}.`,
        confirmButtonColor: '#F2600C',
      });
      router.push('/admin');
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Activation impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-bold text-red-700">Invitation invalide</p>
          <p className="mt-2 text-sm text-red-600">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F2600C]/30 border-t-[#F2600C]" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-lg sm:p-8">
        {invite.company?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={invite.company.logo} alt={invite.company.name} className="mb-4 h-10 object-contain" />
        ) : (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4EE] text-xl font-bold text-[#F2600C]">
            {(invite.company?.name || '?').slice(0, 1).toUpperCase()}
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-[#0E0E10]">Rejoindre {invite.company?.name}</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Invitation pour <span className="font-medium text-[#0E0E10]">{invite.email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#374151]">Votre prénom / nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
              placeholder="Marie Dupont"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#374151]">Choisissez un mot de passe</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 pr-11 text-sm outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
                placeholder="8 caractères minimum"
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
            {isSubmitting ? 'Activation...' : 'Rejoindre l\'équipe'}
          </button>
        </form>
      </div>
    </main>
  );
}
