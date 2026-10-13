'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Alert } from '@/lib/sweetalert';
import type { ApiError, Application, ApplicationStatus } from '@/app/types/application';
import { apiFetch } from '@/lib/api';
// FIX-CONTRAST: lisibilite corrigee

interface StatusSelectorProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
  onStatusUpdated: (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color' | 'interview_date' | 'interview_location'>) => void;
}

const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
  { value: 'pending', label: 'En attente' },
  { value: 'reviewing', label: 'En cours d\'examen' },
  { value: 'interview', label: 'Entretien prévu' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
];

const STATUS_TONES: Record<ApplicationStatus, { pill: string; dot: string; icon: string }> = {
  pending:   { pill: 'border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:border-[#D1D5DB]', dot: 'bg-[#9CA3AF]', icon: 'text-[#9CA3AF]' },
  reviewing: { pill: 'border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8] hover:border-[#BFDBFE]', dot: 'bg-[#3B82F6]', icon: 'text-[#60A5FA]' },
  interview: { pill: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] hover:border-[#FCD34D]', dot: 'bg-[#F59E0B]', icon: 'text-[#D97706]' },
  accepted:  { pill: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] hover:border-[#6EE7B7]', dot: 'bg-[#10B981]', icon: 'text-[#059669]' },
  rejected:  { pill: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] hover:border-[#FCA5A5]', dot: 'bg-[#EF4444]', icon: 'text-[#DC2626]' },
};

/**
 * Select and confirm status changes, then persist with the Laravel API.
 */
export default function StatusSelector({ applicationId, currentStatus, onStatusUpdated }: StatusSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const promptInterviewDetails = async (): Promise<{ interview_date: string; interview_location: string } | null> => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours() + 1)}:00`;

    const { value, isConfirmed } = await Alert.fire({
      title: 'Planifier l\'entretien',
      html: `
        <div style="text-align:left;display:flex;flex-direction:column;gap:14px;margin-top:4px;">
          <div>
            <label style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;margin-bottom:6px;">Date et heure *</label>
            <input
              id="swal-interview-date"
              type="datetime-local"
              value="${defaultDate}"
              style="width:100%;box-sizing:border-box;border:1px solid #E5E5E5;border-radius:8px;padding:10px 12px;font-size:14px;color:#0E0E10;outline:none;"
            />
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;margin-bottom:6px;">Lieu (optionnel)</label>
            <input
              id="swal-interview-location"
              type="text"
              placeholder="Ex : Siège social, Google Meet, …"
              style="width:100%;box-sizing:border-box;border:1px solid #E5E5E5;border-radius:8px;padding:10px 12px;font-size:14px;color:#0E0E10;outline:none;"
            />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmer l\'entretien',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#F2600C',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const dateInput = (document.getElementById('swal-interview-date') as HTMLInputElement)?.value;
        if (!dateInput) {
          Alert.showValidationMessage('La date est obligatoire.');
          return false;
        }
        const locationInput = (document.getElementById('swal-interview-location') as HTMLInputElement)?.value ?? '';
        return { interview_date: dateInput, interview_location: locationInput };
      },
    });

    if (!isConfirmed || !value) return null;
    return value as { interview_date: string; interview_location: string };
  };

  const handleStatusChange = async (nextStatus: ApplicationStatus): Promise<void> => {
    if (nextStatus === selectedStatus) {
      return;
    }

    const previousStatus = selectedStatus;
    setSelectedStatus(nextStatus);

    let interviewPayload: { interview_date?: string; interview_location?: string } = {};

    if (nextStatus === 'interview') {
      const details = await promptInterviewDetails();
      if (!details) {
        setSelectedStatus(previousStatus);
        return;
      }
      interviewPayload = details;
    } else {
      const confirmation = await Alert.fire({
        title: 'Modifier le statut ?',
        text: 'Voulez-vous vraiment changer le statut de cette candidature ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#F2600C',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) {
        setSelectedStatus(previousStatus);
        return;
      }
    }

    setIsUpdating(true);

    try {
      const updatedApplication = await apiFetch(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, ...interviewPayload }),
      });
      onStatusUpdated(updatedApplication);
      setSelectedStatus(updatedApplication.status);

      await Alert.fire({
        icon: 'success',
        title: 'Succès',
        text: nextStatus === 'interview'
          ? 'Entretien planifié — le candidat a été notifié.'
          : 'Statut mis à jour avec succès',
        confirmButtonText: 'OK',
        confirmButtonColor: '#F2600C',
      });
    } catch (error) {
      const apiError = error as ApiError;
      setSelectedStatus(previousStatus);

      await Alert.fire({
        icon: 'error',
        title: 'Erreur',
        text: apiError.message || 'Impossible de mettre à jour le statut.',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const tone = STATUS_TONES[selectedStatus] ?? STATUS_TONES.pending;

  return (
    <div className="relative inline-flex w-fit">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${tone.dot}`}
      />
      <select
        value={selectedStatus}
        onChange={(event) => void handleStatusChange(event.target.value as ApplicationStatus)}
        disabled={isUpdating}
        aria-label="Statut de la candidature"
        className={`min-w-[148px] cursor-pointer appearance-none rounded-full border py-1.5 pl-7 pr-8 text-[12px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#F2600C]/25 disabled:cursor-wait disabled:opacity-70 ${tone.pill}`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-[#0E0E10]">
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        {isUpdating ? (
          <span className={`block h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent ${tone.icon}`} />
        ) : (
          <ChevronDown size={13} strokeWidth={2.5} className={tone.icon} />
        )}
      </span>
    </div>
  );
}
