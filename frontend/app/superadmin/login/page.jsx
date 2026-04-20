'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Eye, EyeOff, LoaderCircle, Shield } from 'lucide-react';
import { saveSuperAdmin, saveSuperAdminToken, isSuperAdminAuthenticated } from '@/lib/superAdminAuth';
import { saFetch } from '@/lib/superAdminApi';

/**
 * Render super admin login form and authenticate against backend API.
 */
export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdminAuthenticated()) {
      router.replace('/superadmin');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await saFetch('/superadmin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveSuperAdminToken(response.token);
      saveSuperAdmin(response.super_admin);
      router.push('/superadmin');
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Accès refusé',
        text: error instanceof Error ? error.message : 'Impossible de se connecter.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0F1E] px-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-base font-bold text-white">Vaybe</p>
            <p className="text-sm text-gray-400">Super Admin</p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">Accès restreint</h1>
        <p className="mt-2 text-sm text-gray-400">Espace réservé à l&apos;administration</p>
        <div className="my-6 border-t border-gray-700" />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-500"
              placeholder="admin@vaybe.tech"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400">Mot de passe</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 pr-11 text-white placeholder:text-gray-600 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-bold text-gray-900 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Connexion...' : 'Accéder au panneau →'}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
