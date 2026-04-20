'use client';

import { useEffect, useMemo, useState } from 'react';
// FIX-CONTRAST: lisibilite corrigee

const EMPTY_FORM = {
  title: '',
  role: '',
  type: 'full_time',
  location: '',
  description: '',
  expires_at: '',
};

/**
 * Modal form used to create or edit a job posting.
 */
export default function JobFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      setForm({
        title: initialData.title || '',
        role: initialData.role || '',
        type: initialData.type || 'full_time',
        location: initialData.location || '',
        description: initialData.description || '',
        expires_at: initialData.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, initialData]);

  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Le titre est obligatoire.';
    }

    if (!form.role.trim()) {
      nextErrors.role = 'Le rôle est obligatoire.';
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
      const payload = {
        title: form.title.trim(),
        role: form.role,
        type: form.type,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        expires_at: form.expires_at || null,
      };

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#111827]">
          {initialData ? 'Modifier le poste' : 'Nouveau poste'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-[#374151]">Titre du poste</label>
            <input
              id="title"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              placeholder="Développeur Full Stack"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-[#374151]">Rôle</label>
              <select
                id="role"
                name="role"
                required
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="">Sélectionner</option>
                <option value="dev">dev</option>
                <option value="designer">designer</option>
                <option value="manager">manager</option>
                <option value="autre">autre</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-[#374151]">Type de contrat</label>
              <select
                id="type"
                name="type"
                required
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                <option value="full_time">Temps plein</option>
                <option value="part_time">Temps partiel</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Stage</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-[#374151]">Localisation</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              placeholder="Ex: Cotonou ou Remote"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#374151]">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="expires_at" className="mb-1 block text-sm font-medium text-[#374151]">Date de clôture</label>
            <input
              id="expires_at"
              name="expires_at"
              type="date"
              min={minDate}
              value={form.expires_at}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-60"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {initialData ? 'Sauvegarder' : 'Créer le poste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
