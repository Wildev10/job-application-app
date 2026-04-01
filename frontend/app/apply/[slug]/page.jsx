'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';

const INITIAL_FORM = {
  nom: '',
  email: '',
  role: '',
  motivation: '',
  portfolio: '',
  cv: null,
};

/**
 * Render tenant-branded public application form for a given company slug.
 */
export default function ApplyBySlugPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      setIsLoadingCompany(true);
      setNotFound(false);

      try {
        const payload = await apiFetch(`/company/${slug}`, { method: 'GET' });
        setCompany(payload);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoadingCompany(false);
      }
    };

    if (slug) {
      void loadCompany();
    }
  }, [slug]);

  const primaryColor = useMemo(() => company?.color || '#0f766e', [company]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setForm((previous) => ({ ...previous, cv: file }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.nom.trim()) nextErrors.nom = 'Le nom est obligatoire.';
    if (!form.email.trim()) {
      nextErrors.email = 'L\'email est obligatoire.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Email invalide.';
    }
    if (!form.role) nextErrors.role = 'Le rôle est obligatoire.';
    if (!form.motivation.trim()) {
      nextErrors.motivation = 'La motivation est obligatoire.';
    } else if (form.motivation.trim().length < 20) {
      nextErrors.motivation = 'Minimum 20 caractères.';
    }
    if (form.portfolio && !/^https?:\/\//i.test(form.portfolio)) {
      nextErrors.portfolio = 'URL de portfolio invalide.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('nom', form.nom.trim());
      payload.append('email', form.email.trim());
      payload.append('role', form.role);
      payload.append('motivation', form.motivation.trim());

      if (form.portfolio.trim()) {
        payload.append('portfolio', form.portfolio.trim());
      }

      if (form.cv) {
        payload.append('cv', form.cv);
      }

      await apiFetch(`/applications/${slug}`, {
        method: 'POST',
        body: payload,
      });

      setForm(INITIAL_FORM);
      setErrors({});

      await Swal.fire({
        icon: 'success',
        title: 'Candidature envoyée !',
        text: 'Nous avons bien reçu votre candidature.',
        confirmButtonColor: primaryColor,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error instanceof Error ? error.message : 'Impossible de soumettre la candidature.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#fafaf9] px-4 py-8">
        <p className="text-sm text-[#737373]">Chargement de l&apos;espace entreprise...</p>
      </main>
    );
  }

  if (notFound || !company) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#fafaf9] px-4 py-8">
        <section className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Entreprise introuvable</h1>
          <p className="mt-3 text-sm text-[#737373]">
            Le lien de candidature est invalide ou n&apos;existe plus.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#fafaf9] px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6 border-b border-[#ececec] pb-5">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3f4f6] text-sm font-semibold text-[#525252]">
                {company.name?.slice(0, 1)?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#737373]">Candidature</p>
              <h1 className="text-2xl font-extrabold text-[#0f0f0f]">{company.name}</h1>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="nom" className="mb-1 block text-sm font-medium text-[#525252]">Nom</label>
            <input id="nom" name="nom" value={form.nom} onChange={handleChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none" />
            {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#525252]">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-[#525252]">Rôle</label>
              <select id="role" name="role" value={form.role} onChange={handleChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none">
                <option value="">Choisir</option>
                <option value="dev">Dev</option>
                <option value="designer">Designer</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="motivation" className="mb-1 block text-sm font-medium text-[#525252]">Motivation</label>
            <textarea id="motivation" name="motivation" rows={5} value={form.motivation} onChange={handleChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none" />
            {errors.motivation && <p className="mt-1 text-sm text-red-600">{errors.motivation}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="portfolio" className="mb-1 block text-sm font-medium text-[#525252]">Portfolio</label>
              <input id="portfolio" name="portfolio" type="url" value={form.portfolio} onChange={handleChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none" />
              {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>}
            </div>
            <div>
              <label htmlFor="cv" className="mb-1 block text-sm font-medium text-[#525252]">CV</label>
              <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="w-full rounded-md border border-[#d4d4d4] px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: primaryColor }}
            className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer ma candidature'}
          </button>
        </form>
      </section>
    </main>
  );
}
