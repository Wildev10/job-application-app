'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { updateApplicationStatus } from '@/app/lib/api';
import type { ApiError, Application, ApplicationStatus } from '@/app/types/application';

interface StatusSelectorProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
  onStatusUpdated: (updatedApplication: Pick<Application, 'id' | 'status' | 'status_label' | 'status_color'>) => void;
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

  const handleStatusChange = async (nextStatus: ApplicationStatus): Promise<void> => {
    if (nextStatus === selectedStatus) {
      return;
    }

    const previousStatus = selectedStatus;
    setSelectedStatus(nextStatus);

    const confirmation = await Swal.fire({
      title: 'Modifier le statut ?',
      text: 'Voulez-vous vraiment changer le statut de cette candidature ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      setSelectedStatus(previousStatus);
      return;
    }

    setIsUpdating(true);

    try {
      const updatedApplication = await updateApplicationStatus(applicationId, nextStatus);
      onStatusUpdated(updatedApplication);
      setSelectedStatus(updatedApplication.status);

      await Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Statut mis à jour avec succès',
        confirmButtonText: 'OK',
        confirmButtonColor: '#16a34a',
      });
    } catch (error) {
      const apiError = error as ApiError;
      setSelectedStatus(previousStatus);

      await Swal.fire({
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
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none transition focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isUpdating && <span className="text-xs text-gray-500">Mise à jour...</span>}
    </div>
  );
}
