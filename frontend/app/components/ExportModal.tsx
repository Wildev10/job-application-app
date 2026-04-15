'use client';

import { useEffect, useMemo, useState } from 'react';

type ExportFilters = {
  status?: string;
  role?: string;
  date_from?: string;
  date_to?: string;
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: ExportFilters) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewing', label: 'En cours d\'examen' },
  { value: 'interview', label: 'Entretien prévu' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'dev', label: 'Développeur' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Autre' },
];

/**
 * Display export filters before triggering the CSV download.
 */
export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Close the modal when the user presses Escape for accessibility.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const summary = useMemo(() => {
    const selectedStatus = STATUS_OPTIONS.find((option) => option.value === status)?.label.toLowerCase() || 'tous statuts';
    const selectedRole = ROLE_OPTIONS.find((option) => option.value === role)?.label.toLowerCase() || 'tous rôles';

    let selectedPeriod = 'sur toute la période';

    if (dateFrom && dateTo) {
      selectedPeriod = `du ${dateFrom} au ${dateTo}`;
    } else if (dateFrom) {
      selectedPeriod = `à partir du ${dateFrom}`;
    } else if (dateTo) {
      selectedPeriod = `jusqu'au ${dateTo}`;
    }

    return `Vous allez exporter les candidatures ${selectedStatus}, ${selectedRole}, ${selectedPeriod}.`;
  }, [dateFrom, dateTo, role, status]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e7e5e4] px-6 py-5">
          <div>
            <h2 id="export-modal-title" className="text-xl font-bold text-[#0f172a]">
              Exporter les candidatures
            </h2>
            <p className="mt-1 text-sm text-[#57534e]">
              Choisissez des filtres optionnels avant de télécharger le fichier CSV.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#78716c] transition hover:bg-[#f5f5f4] hover:text-[#0f172a]"
            aria-label="Fermer la modale d export"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-[#44403c]">
              <span className="font-medium">Statut</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-[#d6d3d1] bg-white px-3 py-2.5 outline-none focus:border-[#15803d]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || 'all-statuses'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-[#44403c]">
              <span className="font-medium">Rôle</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-lg border border-[#d6d3d1] bg-white px-3 py-2.5 outline-none focus:border-[#15803d]"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value || 'all-roles'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-[#44403c]">
              <span className="font-medium">À partir du</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-lg border border-[#d6d3d1] px-3 py-2.5 outline-none focus:border-[#15803d]"
              />
            </label>

            <label className="space-y-2 text-sm text-[#44403c]">
              <span className="font-medium">Jusqu&apos;au</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-lg border border-[#d6d3d1] px-3 py-2.5 outline-none focus:border-[#15803d]"
              />
            </label>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            {summary}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#e7e5e4] px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#e7e5e4] px-4 py-2.5 text-sm font-semibold text-[#44403c] transition hover:bg-[#d6d3d1]"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => onExport({
              status,
              role,
              date_from: dateFrom,
              date_to: dateTo,
            })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15803d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
          >
            <span aria-hidden="true">↓</span>
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
