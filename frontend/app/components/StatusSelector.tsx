'use client';

import { useEffect, useState } from 'react';
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

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={selectedStatus}
        onChange={(event) => void handleStatusChange(event.target.value as ApplicationStatus)}
        disabled={isUpdating}
        className="min-w-40 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-semibold text-[#0E0E10] outline-none transition focus:border-[#F2600C] focus:ring-2 focus:ring-[#F2600C]/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isUpdating && <span className="text-xs text-[#9CA3AF]">Mise à jour...</span>}
    </div>
  );
}
