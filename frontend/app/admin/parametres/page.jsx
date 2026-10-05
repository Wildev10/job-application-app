'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import PaymentHistory from '@/components/PaymentHistory';
import PlanBadge from '@/components/PlanBadge';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { getCompany, saveCompany } from '@/lib/auth';

/**
 * Render company settings and email automation information.
 */
export default function AdminParametresPage() {
  const initialCompany = getCompany();
  const { planLimits, isPro, isStarter } = usePlanStatus();
  const [company, setCompany] = useState(initialCompany);
  const [name, setName] = useState(initialCompany?.name || '');
  const [color, setColor] = useState(initialCompany?.color || '#F2600C');
  const [tagline, setTagline] = useState(initialCompany?.tagline || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);

  const [emailDefaults, setEmailDefaults] = useState({});
  const [emailTemplates, setEmailTemplates] = useState({ reviewing: '', interview: '', accepted: '', rejected: '' });
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);

  useEffect(() => {
    apiFetch('/company/email-templates', { method: 'GET' })
      .then((data) => {
        setEmailDefaults(data.defaults || {});
        const saved = data.custom || {};
        setEmailTemplates({
          reviewing: saved.reviewing || '',
          interview: saved.interview || '',
          accepted: saved.accepted || '',
          rejected: saved.rejected || '',
        });
      })
      .catch(() => {});
  }, []);

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
    if (!company?.slug) return '';
    return `${publicBaseUrl.replace(/\/$/, '')}/apply/${company.slug}`;
  }, [company, publicBaseUrl]);

  const publicCareersUrl = useMemo(() => {
    if (!company?.slug) return '';
    return `${publicBaseUrl.replace(/\/$/, '')}/careers/${company.slug}`;
  }, [company, publicBaseUrl]);

  const planExpirationDate = useMemo(() => {
    const raw = company?.plan_expires_at;
    if (!raw) {
      return null;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }, [company?.plan_expires_at]);

  const expiresSoon = useMemo(() => {
    if (!planExpirationDate) {
      return false;
    }

    const diffMs = planExpirationDate.getTime() - Date.now();
    return diffMs > 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }, [planExpirationDate]);

  const handleSave = async () => {
    if (!name.trim()) {
      await Alert.fire({
        icon: 'warning',
        title: 'Nom requis',
        text: 'Veuillez renseigner un nom d\'entreprise.',
        confirmButtonColor: '#F2600C',
      });

      return;
    }

    setIsSaving(true);

    try {
      const payload = await apiFetch('/company/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          color,
          tagline: tagline.trim() || null,
        }),
      });

      const nextCompany = payload?.company || {
        ...(company || {}),
        name: name.trim(),
        color,
      };

      setCompany(nextCompany);
      saveCompany(nextCompany);

      await Alert.fire({
        icon: 'success',
        title: 'Informations mises à jour',
        text: 'Vos changements ont été sauvegardés.',
        confirmButtonColor: '#F2600C',
      });
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de la sauvegarde',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLogoState = (logo) => {
    const nextCompany = { ...(company || {}), logo };
    setCompany(nextCompany);
    saveCompany(nextCompany);
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.size > 1024 * 1024) {
      await Alert.fire({
        icon: 'warning',
        title: 'Logo trop lourd',
        text: 'Le logo ne doit pas dépasser 1 Mo.',
        confirmButtonColor: '#F2600C',
      });

      return;
    }

    setIsUploadingLogo(true);

    try {
      const body = new FormData();
      body.append('logo', file);
      const payload = await apiFetch('/company/logo', { method: 'POST', body });
      updateLogoState(payload?.logo || null);
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de l\'envoi du logo',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    setIsUploadingLogo(true);

    try {
      await apiFetch('/company/logo', { method: 'DELETE' });
      updateLogoState(null);
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicApplyUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicApplyUrl);

      await Alert.fire({
        icon: 'success',
        title: 'Lien copié !',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      await Alert.fire({
        icon: 'error',
        title: 'Impossible de copier',
        text: 'Veuillez copier le lien manuellement.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleTestForm = () => {
    if (!publicApplyUrl) {
      return;
    }

    window.open(publicApplyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveTemplates = async () => {
    setIsSavingTemplates(true);
    try {
      await apiFetch('/company/email-templates', {
        method: 'PUT',
        body: JSON.stringify(emailTemplates),
      });
      await Alert.fire({
        icon: 'success',
        title: 'Templates sauvegardés',
        confirmButtonColor: '#F2600C',
      });
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de la sauvegarde',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSavingTemplates(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#0E0E10] sm:text-3xl">Paramètres</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Ajustez les informations visibles de votre entreprise et partagez votre lien de candidature.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0E0E10]">Informations de l&apos;entreprise</h2>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-[#FAFAFA] p-4">
          {company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt="Logo de l'entreprise" className="h-16 w-16 rounded-lg bg-white object-contain" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#F2600C] shadow-sm">
              {(company?.name || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#374151]">Logo (png, jpg ou webp, 1 Mo max)</p>
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleLogoChange(event)} className="hidden" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-sm font-semibold text-[#0E0E10] hover:bg-white disabled:opacity-60"
              >
                {isUploadingLogo ? 'Envoi...' : company?.logo ? 'Changer' : 'Ajouter un logo'}
              </button>
              {company?.logo ? (
                <button
                  type="button"
                  onClick={() => void handleLogoRemove()}
                  disabled={isUploadingLogo}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Supprimer
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#374151]">
            <span className="font-medium">Nom de l&apos;entreprise</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
              placeholder="Nom de votre entreprise"
            />
          </label>

          <label className="space-y-2 text-sm text-[#374151]">
            <span className="font-medium">Couleur principale</span>
            <div className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] px-3 py-2">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-8 w-10 cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-sm text-[#6B7280]">{color}</span>
            </div>
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm text-[#374151]">
          <span className="font-medium">Accroche de la page de candidature</span>
          <input
            type="text"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            maxLength={255}
            placeholder="Ex : Rejoignez une équipe passionnée et ambitieuse !"
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#0E0E10] outline-none focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
          />
          <p className="text-xs text-[#9CA3AF]">Texte affiché sous votre nom sur le formulaire public. Facultatif.</p>
        </label>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#F2600C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0E0E10]">Emails envoyés automatiquement</h2>

        <ul className="mt-4 space-y-3 text-sm text-[#6B7280]">
          <li className="flex items-center gap-2">
            <span className="text-[#22A559]">✓</span>
            Confirmation au candidat — À chaque nouvelle candidature
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#22A559]">✓</span>
            Alerte au recruteur — À chaque nouvelle candidature
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#22A559]">✓</span>
            Mise à jour de statut — À chaque changement de statut
          </li>
        </ul>

        <p className="mt-4 text-sm text-[#9CA3AF]">
          Ces emails sont envoyés depuis noreply@vaybe.tech au nom de votre entreprise.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0E0E10]">Messages personnalisés — statut candidature</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Personnalisez le texte envoyé au candidat lors de chaque changement de statut. Laissez vide pour utiliser le message par défaut.
        </p>

        <div className="mt-5 space-y-5">
          {[
            { key: 'reviewing', label: 'En examen' },
            { key: 'interview', label: 'Entretien planifié' },
            { key: 'accepted', label: 'Candidature acceptée' },
            { key: 'rejected', label: 'Candidature refusée' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">{label}</label>
              <textarea
                rows={3}
                value={emailTemplates[key]}
                onChange={(e) => setEmailTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={emailDefaults[key] || ''}
                maxLength={1000}
                className="w-full resize-y rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#0E0E10] outline-none placeholder:text-[#9CA3AF] focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/20"
              />
              {emailTemplates[key] && (
                <button
                  type="button"
                  onClick={() => setEmailTemplates((prev) => ({ ...prev, [key]: '' }))}
                  className="mt-1 text-xs text-[#9CA3AF] hover:text-red-500"
                >
                  Réinitialiser au message par défaut
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleSaveTemplates()}
          disabled={isSavingTemplates}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#F2600C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D44F08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingTemplates ? 'Sauvegarde...' : 'Sauvegarder les messages'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0E0E10]">Abonnement &amp; Paiements</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PlanBadge plan={planLimits?.plan || 'starter'} />

          {isPro && planExpirationDate && (
            <p className="text-sm text-[#6B7280]">
              Valide jusqu&apos;au {planExpirationDate.toLocaleDateString('fr-FR')}
            </p>
          )}

          {isPro && expiresSoon && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              ⚠️ Expire bientôt
            </span>
          )}
        </div>

        <div className="mt-4">
          {isPro ? (
            <Link
              href="/admin/upgrade"
              className="inline-flex rounded-lg border border-[#F2600C] px-4 py-2 text-sm font-semibold text-[#F2600C] transition hover:bg-[#FFF4EE]"
            >
              Renouveler
            </Link>
          ) : null}

          {isStarter ? (
            <Link
              href="/admin/upgrade"
              className="inline-flex rounded-lg bg-[#F2600C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D44F08]"
            >
              Passer au Pro
            </Link>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-[#F2600C]">Besoin d&apos;une facture ? Contactez-nous</p>
      </div>

      <PaymentHistory />

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-bold text-[#0E0E10]">Liens publics</h2>

        <div className="mt-4 space-y-4">
          {/* Careers page */}
          <div className="rounded-xl bg-[#FAFAFA] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">Page vitrine des postes</p>
            <p className="mt-1 break-all text-sm font-bold text-[#0E0E10]">
              {publicCareersUrl || 'URL indisponible : slug entreprise manquant.'}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Partagez cette URL sur LinkedIn, votre site ou vos réseaux.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!publicCareersUrl) return;
                  try {
                    await navigator.clipboard.writeText(publicCareersUrl);
                    await Alert.fire({ icon: 'success', title: 'Lien copié !', timer: 1400, showConfirmButton: false });
                  } catch {
                    await Alert.fire({ icon: 'error', title: 'Impossible de copier', text: 'Copiez le lien manuellement.', confirmButtonColor: '#dc2626' });
                  }
                }}
                disabled={!publicCareersUrl}
                className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-sm font-semibold text-[#0E0E10] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Copier
              </button>
              <button
                type="button"
                onClick={() => publicCareersUrl && window.open(publicCareersUrl, '_blank', 'noopener,noreferrer')}
                disabled={!publicCareersUrl}
                className="rounded-lg bg-[#0E0E10] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1A1A1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voir la page
              </button>
            </div>
          </div>

          {/* Apply form */}
          <div className="rounded-xl bg-[#FAFAFA] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">Formulaire de candidature libre</p>
            <p className="mt-1 break-all text-sm font-bold text-[#0E0E10]">
              {publicApplyUrl || 'URL indisponible : slug entreprise manquant.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                disabled={!publicApplyUrl}
                className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-sm font-semibold text-[#0E0E10] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Copier
              </button>
              <button
                type="button"
                onClick={handleTestForm}
                disabled={!publicApplyUrl}
                className="rounded-lg bg-[#0E0E10] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1A1A1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tester
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
