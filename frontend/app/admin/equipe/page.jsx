'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, UserPlus, Users } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import { apiFetch } from '@/lib/api';
import { getMember } from '@/lib/auth';

const STATUS_LABEL = { pending: 'En attente', active: 'Actif' };
const STATUS_CLASS = {
  pending: 'bg-amber-50 text-amber-700',
  active: 'bg-[#F0FDF4] text-[#22A559]',
};

/**
 * Team management page — invite and manage company recruiters.
 */
export default function AdminEquipePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const currentMember = getMember();
  const isOwner = !currentMember;

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/company/members', { method: 'GET' });
      setMembers(Array.isArray(data.data) ? data.data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const handleInvite = async () => {
    const { value: email } = await Alert.fire({
      title: 'Inviter un recruteur',
      input: 'email',
      inputPlaceholder: 'Email du recruteur',
      confirmButtonText: 'Envoyer l\'invitation',
      confirmButtonColor: '#F2600C',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      inputValidator: (v) => (!v ? 'Email requis' : null),
    });

    if (!email) return;

    setIsInviting(true);
    try {
      await apiFetch('/company/members', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      await Alert.fire({
        icon: 'success',
        title: 'Invitation envoyée !',
        text: `Un email a été envoyé à ${email}.`,
        confirmButtonColor: '#F2600C',
      });
      void loadMembers();
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Échec de l\'invitation',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (member) => {
    const { isConfirmed } = await Alert.fire({
      title: `Retirer ${member.name || member.email} ?`,
      text: 'Cette personne n\'aura plus accès au dashboard.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Retirer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });
    if (!isConfirmed) return;

    try {
      await apiFetch(`/company/members/${member.id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (error) {
      await Alert.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#0E0E10]">Équipe recrutement</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Invitez des collaborateurs à accéder au dashboard.</p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => void handleInvite()}
            disabled={isInviting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F2600C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D44F08] disabled:opacity-60"
          >
            <UserPlus size={17} strokeWidth={2.5} />
            Inviter un recruteur
          </button>
        )}
      </header>

      {!isOwner && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Seul le propriétaire du compte peut inviter ou retirer des membres.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F5F5F5]" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF4EE]">
              <Users size={24} className="text-[#F2600C]" />
            </div>
            <p className="font-semibold text-[#0E0E10]">Aucun membre invité</p>
            <p className="mt-1 text-sm text-[#9CA3AF]">Invitez des recruteurs pour collaborer sur vos candidatures.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0F0F0]">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4EE] font-bold text-[#F2600C]">
                  {(member.name || member.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0E0E10]">
                    {member.name || <span className="italic text-[#9CA3AF]">En attente d&apos;activation</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#6B7280]">
                    <Mail size={11} />
                    {member.email}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[member.status] || ''}`}>
                  {STATUS_LABEL[member.status] || member.status}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => void handleRemove(member)}
                    className="shrink-0 rounded-lg p-2 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-500"
                    title="Retirer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Comment ça marche</p>
        <ol className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
          <li>1. Saisissez l&apos;email de votre collaborateur et envoyez l&apos;invitation.</li>
          <li>2. Il reçoit un email avec un lien pour créer son accès (nom + mot de passe).</li>
          <li>3. Il se connecte sur <span className="font-medium text-[#0E0E10]">/member/login</span> et accède au même dashboard.</li>
        </ol>
      </div>
    </section>
  );
}
