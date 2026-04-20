'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Alert } from '@/lib/sweetalert';
import { submitApplication } from '@/app/lib/api';
import type { ApiError, ApplicationFormData } from '@/app/types/application';
// FIX-CONTRAST: lisibilite corrigee

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

        void Alert.fire({
          icon: 'error',
          title: 'Format de CV invalide',
          text: 'Veuillez sélectionner un fichier PDF, DOC ou DOCX.',
          confirmButtonColor: '#0d9488',
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

      await Alert.fire({
        icon: 'success',
        title: 'Candidature envoyée !',
        text: 'Nous avons bien reçu votre candidature. Nous vous contacterons bientôt.',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0F0F0F',
        background: '#FAFAF9',
        color: '#0F0F0F',
        customClass: {
          popup: 'rounded-md',
          confirmButton: 'px-6 py-2 text-sm font-medium',
        },
      });

      setHasSubmitted(true);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 422) {
        setErrors(mapApiErrors(apiError));
      } else {
        void Alert.fire({
          icon: 'error',
          title: 'Une erreur est survenue',
          text: 'Impossible de soumettre votre candidature. Veuillez réessayer.',
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#0F0F0F',
          background: '#FAFAF9',
          color: '#0F0F0F',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <section className="w-full max-w-3xl border-t border-[#d4d4d4] pt-8 sm:pt-10">
        <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-4xl">
          Merci pour votre candidature et l&apos;intérêt que vous portez à notre entreprise
        </h1>
        <div className="mt-6 space-y-5 text-base leading-relaxed text-[#525252]">
          <p>
            Nous avons bien reçu votre profil. Nous allons procéder à une analyse des candidatures
            dans les prochains jours. Les profils retenus seront contactés pour la suite du
            processus (évaluation + entretien).
          </p>
          <p>Nous reviendrons vers vous très rapidement.</p>
        </div>
        <div className="mt-8 text-sm text-[#525252]">
          <Link
            href="/"
            onClick={() => setHasSubmitted(false)}
            className="inline-flex items-center border-b border-[#0f0f0f] pb-0.5 font-medium text-[#0f0f0f] hover:text-[#ff4d00] hover:border-[#ff4d00]"
          >
            Revenir au formulaire
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl border-t border-[#d4d4d4] pt-8 sm:pt-10">
      <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-4xl">
        Déposez votre candidature
      </h2>
      <p className="mt-3 max-w-xl text-sm font-medium text-[#525252] sm:text-base">
        Quelques informations suffisent. Nous revenons vers les profils retenus rapidement.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8" noValidate>
        <div className="space-y-2">
          <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
            Nom complet
          </label>
          <input
            id="nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#a3a3a3] focus:border-[#ff4d00]"
            placeholder="Jane Doe"
            required
          />
          {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#a3a3a3] focus:border-[#ff4d00]"
              placeholder="jane@example.com"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-[15px] text-[#0f0f0f] outline-none focus:border-[#ff4d00]"
              required
            >
              <option value="">Choisir un rôle</option>
              <option value="dev">Dev</option>
              <option value="designer">Designer</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="motivation" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
            Motivation
          </label>
          <textarea
            id="motivation"
            name="motivation"
            rows={5}
            value={form.motivation}
            onChange={handleChange}
            className="w-full resize-none border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#a3a3a3] focus:border-[#ff4d00]"
            placeholder="Expliquez pourquoi vous êtes la bonne personne pour ce rôle..."
            required
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
            {errors.motivation ? (
              <p className="text-sm text-red-600">{errors.motivation}</p>
            ) : (
              <p className="text-[#737373]">Minimum 20 caractères</p>
            )}
            <p className="text-[#737373]">{motivationCount} caractères</p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="portfolio" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
              Portfolio (optionnel)
            </label>
            <input
              id="portfolio"
              name="portfolio"
              type="url"
              value={form.portfolio}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#a3a3a3] focus:border-[#ff4d00]"
              placeholder="https://mon-portfolio.com"
            />
            {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="cv" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">
              CV (pdf/doc/docx, optionnel)
            </label>
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full border-0 border-b border-[#d4d4d4] bg-transparent px-0 py-3 text-sm text-[#525252] outline-none file:mr-4 file:rounded-md file:border file:border-[#d4d4d4] file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#0f0f0f] hover:file:border-[#0f0f0f]"
            />
            {errors.cv && <p className="mt-1 text-sm text-red-600">{errors.cv}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#0f0f0f] px-8 py-4 text-sm font-semibold tracking-wide text-white hover:-translate-y-[1px] hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </button>
      </form>
    </section>
  );
}
