'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { submitApplication } from '@/app/lib/api';
import type { ApiError, ApplicationFormData } from '@/app/types/application';

type FormErrors = Partial<Record<keyof ApplicationFormData, string>>;

const INITIAL_FORM: ApplicationFormData = {
  nom: '',
  email: '',
  role: '',
  motivation: '',
  portfolio: '',
  cv: null,
};

const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_CV_EXTENSIONS = ['pdf', 'doc', 'docx'];

/**
 * Validate client-side rules before sending multipart payload.
 */
function validateForm(data: ApplicationFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.nom.trim()) {
    errors.nom = 'Le nom est obligatoire.';
  }

  if (!data.email.trim()) {
    errors.email = 'L\'email est obligatoire.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Le format de l\'email est invalide.';
  }

  if (!data.role) {
    errors.role = 'Le rôle est obligatoire.';
  }

  if (!data.motivation.trim()) {
    errors.motivation = 'La motivation est obligatoire.';
  } else if (data.motivation.trim().length < 20) {
    errors.motivation = 'La motivation doit contenir au moins 20 caractères.';
  }

  if (data.portfolio && !/^https?:\/\//i.test(data.portfolio)) {
    errors.portfolio = 'Le portfolio doit être une URL valide.';
  }

  if (data.cv) {
    const extension = data.cv.name.split('.').pop()?.toLowerCase();
    const hasAllowedMime = !data.cv.type || ALLOWED_CV_MIME_TYPES.includes(data.cv.type);
    const hasAllowedExtension = !!extension && ALLOWED_CV_EXTENSIONS.includes(extension);

    if (!hasAllowedMime || !hasAllowedExtension) {
      errors.cv = 'Le CV doit être un fichier pdf, doc ou docx.';
    }

    const maxBytes = 2 * 1024 * 1024;
    if (data.cv.size > maxBytes) {
      errors.cv = 'Le CV ne doit pas dépasser 2 Mo.';
    }
  }

  return errors;
}

/**
 * Normalize backend 422 payload into field-level messages.
 */
function mapApiErrors(error: ApiError): FormErrors {
  const mapped: FormErrors = {};

  if (!error.errors) {
    return mapped;
  }

  const keys = Object.keys(error.errors) as Array<keyof ApplicationFormData>;
  for (const key of keys) {
    const first = error.errors[key]?.[0];
    if (first) {
      mapped[key] = first;
    }
  }

  return mapped;
}

/**
 * Candidate application form with client validation and API error handling.
 */
export default function ApplicationForm() {
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const motivationCount = useMemo(() => form.motivation.trim().length, [form.motivation]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const hasAllowedMime = !file.type || ALLOWED_CV_MIME_TYPES.includes(file.type);
      const hasAllowedExtension = !!extension && ALLOWED_CV_EXTENSIONS.includes(extension);

      if (!hasAllowedMime || !hasAllowedExtension) {
        setErrors((previous) => ({
          ...previous,
          cv: 'Le CV doit être un fichier pdf, doc ou docx.',
        }));
        setForm((previous) => ({ ...previous, cv: null }));
        event.target.value = '';

        void Swal.fire({
          icon: 'error',
          title: 'Format de CV invalide',
          text: 'Veuillez sélectionner un fichier PDF, DOC ou DOCX.',
          confirmButtonColor: '#4f46e5',
        });

        return;
      }
    }

    setForm((previous) => ({ ...previous, cv: file }));
    setErrors((previous) => ({ ...previous, cv: '' }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      void Swal.fire({
        icon: 'error',
        title: 'Formulaire invalide',
        text: 'Merci de corriger les champs en erreur.',
        confirmButtonColor: '#4f46e5',
      });

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

      await submitApplication(payload);

      setForm(INITIAL_FORM);
      setErrors({});

      await Swal.fire({
        icon: 'success',
        title: 'Candidature envoyée',
        text: 'Votre candidature a été envoyée avec succès.',
        confirmButtonColor: '#4f46e5',
      });

      setHasSubmitted(true);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 422) {
        setErrors(mapApiErrors(apiError));

        void Swal.fire({
          icon: 'error',
          title: 'Erreur de validation',
          text: apiError.message || 'Certains champs sont invalides.',
          confirmButtonColor: '#4f46e5',
        });
      } else {
        void Swal.fire({
          icon: 'error',
          title: 'Erreur serveur',
          text: apiError.message || 'Une erreur est survenue. Veuillez réessayer.',
          confirmButtonColor: '#4f46e5',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <section className="w-full max-w-3xl rounded-3xl border border-indigo-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Merci pour votre candidature et l&apos;intérêt que vous portez à notre entreprise
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
          <p>
            Nous avons bien reçu votre profil. Nous allons procéder à une analyse des candidatures
            dans les prochains jours. Les profils retenus seront contactés pour la suite du
            processus (évaluation + entretien).
          </p>
          <p>Nous reviendrons vers vous très rapidement.</p>
        </div>
        <div className="mt-6 text-center text-sm text-slate-700 sm:text-left">
          <Link
            href="/"
            onClick={() => setHasSubmitted(false)}
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Revenir au formulaire
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-3xl border border-indigo-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Candidature</h1>
      <p className="mt-2 text-sm text-slate-600">
        Remplissez le formulaire ci-dessous pour postuler au poste de vos rêves.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="nom" className="mb-1 block text-sm font-semibold text-slate-800">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
            placeholder="Jane Doe"
            required
          />
          {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-800">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
              placeholder="jane@example.com"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-semibold text-slate-800">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
              required
            >
              <option value="">Choisir un rôle</option>
              <option value="dev">Dev</option>
              <option value="designer">Designer</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="motivation" className="mb-1 block text-sm font-semibold text-slate-800">
            Motivation
          </label>
          <textarea
            id="motivation"
            name="motivation"
            rows={5}
            value={form.motivation}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
            placeholder="Expliquez pourquoi vous êtes la bonne personne pour ce rôle..."
            required
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            {errors.motivation ? (
              <p className="text-sm text-red-600">{errors.motivation}</p>
            ) : (
              <p className="text-xs text-slate-500">Minimum 20 caractères</p>
            )}
            <p className="text-xs text-slate-500">{motivationCount} caractères</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="portfolio" className="mb-1 block text-sm font-semibold text-slate-800">
              Portfolio (optionnel)
            </label>
            <input
              id="portfolio"
              name="portfolio"
              type="url"
              value={form.portfolio}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
              placeholder="https://mon-portfolio.com"
            />
            {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>}
          </div>

          <div>
            <label htmlFor="cv" className="mb-1 block text-sm font-semibold text-slate-800">
              CV (pdf/doc/docx, optionnel)
            </label>
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {errors.cv && <p className="mt-1 text-sm text-red-600">{errors.cv}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </button>
      </form>
    </section>
  );
}
