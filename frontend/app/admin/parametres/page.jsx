'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';
import { getCompany, saveCompany } from '@/lib/auth';

/**
 * Render company settings and email automation information.
 */
export default function AdminParametresPage() {
  const initialCompany = getCompany();
  const [company, setCompany] = useState(initialCompany);
  const [name, setName] = useState(initialCompany?.name || '');
  const [color, setColor] = useState(initialCompany?.color || '#0f766e');
  const [isSaving, setIsSaving] = useState(false);

  const publicBaseUrl = useMemo(() => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    return 'http://localhost:3000';
  }, []);

  const publicApplyUrl = useMemo(() => {
    if (!company?.slug) {
      return '';
    }

    return `${publicBaseUrl.replace(/\/$/, '')}/apply/${company.slug}`;
  }, [company, publicBaseUrl]);

  const handleSave = async () => {
    if (!name.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nom requis',
        text: 'Veuillez renseigner un nom d entreprise.',
        confirmButtonColor: '#0F0F0F',
      });

      return;
    }

    setIsSaving(true);

    try {
      // Update company profile from settings using authenticated API.
      const payload = await apiFetch('/company/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          color,
        }),
      });

      const nextCompany = payload?.company || {
        ...(company || {}),
        name: name.trim(),
        color,
      };

      setCompany(nextCompany);
      saveCompany(nextCompany);

      await Swal.fire({
        icon: 'success',
        title: 'Informations mises a jour',
        text: 'Vos changements ont ete sauvegardes.',
        confirmButtonColor: '#0F0F0F',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Echec de la sauvegarde',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicApplyUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicApplyUrl);

      await Swal.fire({
        icon: 'success',
        title: 'Lien copie !',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Impossible de copier',
        text: 'Veuillez copier le lien manuellement.',
        confirmButtonColor: '#DC2626',
      });
    }
  };

  const handleTestForm = () => {
    if (!publicApplyUrl) {
      return;
    }

    window.open(publicApplyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-3xl">Parametres</h1>
        <p className="mt-2 text-sm text-[#525252]">
          Ajustez les informations visibles de votre entreprise et partagez votre lien de candidature.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0f0f0f]">Informations de l entreprise</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#44403c]">
            <span className="font-medium">Nom de l entreprise</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-[#d6d3d1] px-3 py-2.5 outline-none focus:border-[#0f0f0f]"
              placeholder="Nom de votre entreprise"
            />
          </label>

          <label className="space-y-2 text-sm text-[#44403c]">
            <span className="font-medium">Couleur principale</span>
            <div className="flex items-center gap-3 rounded-lg border border-[#d6d3d1] px-3 py-2">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-8 w-10 cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-sm text-[#57534e]">{color}</span>
            </div>
          </label>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0f0f0f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0f0f0f]">Emails envoyes automatiquement</h2>

        <ul className="mt-4 space-y-3 text-sm text-[#44403c]">
          <li>✅ Confirmation au candidat - A chaque nouvelle candidature</li>
          <li>✅ Alerte au recruteur - A chaque nouvelle candidature</li>
          <li>✅ Mise a jour de statut - A chaque changement de statut</li>
        </ul>

        <p className="mt-4 text-sm text-[#57534e]">
          Ces emails sont envoyes depuis noreply@vaybe.tech au nom de votre entreprise.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0f0f0f]">Lien de candidature public</h2>

        <div className="mt-4 rounded-lg bg-[#f5f5f4] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#78716c]">URL du formulaire</p>
          <p className="mt-1 break-all text-sm font-bold text-[#0f0f0f]">
            {publicApplyUrl || 'URL indisponible: slug entreprise manquant.'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            disabled={!publicApplyUrl}
            className="rounded-lg border border-[#d6d3d1] px-4 py-2 text-sm font-semibold text-[#292524] hover:bg-[#f5f5f4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Copier le lien
          </button>

          <button
            type="button"
            onClick={handleTestForm}
            disabled={!publicApplyUrl}
            className="rounded-lg border border-[#0f0f0f] px-4 py-2 text-sm font-semibold text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tester le formulaire
          </button>
        </div>
      </div>
    </section>
  );
}
