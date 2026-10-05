'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Star } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Alert } from '@/lib/sweetalert';
import type { Application, ApplicationStatus } from '@/app/types/application';

type ColumnDef = {
  id: ApplicationStatus;
  label: string;
  headerClass: string;
  colClass: string;
};

const COLUMNS: ColumnDef[] = [
  {
    id: 'pending',
    label: 'En attente',
    headerClass: 'text-[#6B7280] bg-[#F5F5F5] border-[#E5E5E5]',
    colClass: 'bg-[#FAFAFA] border-[#E5E5E5]',
  },
  {
    id: 'reviewing',
    label: 'En examen',
    headerClass: 'text-[#3B82F6] bg-[#EFF6FF] border-[#BFDBFE]',
    colClass: 'bg-[#F8FBFF] border-[#BFDBFE]',
  },
  {
    id: 'interview',
    label: 'Entretien',
    headerClass: 'text-amber-700 bg-amber-50 border-amber-200',
    colClass: 'bg-amber-50/40 border-amber-200',
  },
  {
    id: 'accepted',
    label: 'Accepté',
    headerClass: 'text-[#22A559] bg-[#F0FDF4] border-[#86EFAC]',
    colClass: 'bg-[#F0FDF4]/50 border-[#86EFAC]',
  },
  {
    id: 'rejected',
    label: 'Refusé',
    headerClass: 'text-red-600 bg-red-50 border-red-200',
    colClass: 'bg-red-50/40 border-red-200',
  },
];

const LABEL_MAP: Record<ApplicationStatus, string> = {
  pending: 'En attente',
  reviewing: 'En examen',
  interview: 'Entretien',
  accepted: 'Accepté',
  rejected: 'Refusé',
};

type UpdatedApplication = Pick<
  Application,
  'id' | 'status' | 'status_label' | 'status_color' | 'interview_date' | 'interview_location'
>;

function KanbanCard({ application, isDragging = false }: { application: Application; isDragging?: boolean }) {
  const score = Math.max(0, Math.min(10, application.score || 0));
  const scoreClass =
    score >= 8
      ? 'text-[#F2600C] bg-[#FFF4EE]'
      : score >= 4
        ? 'text-amber-700 bg-amber-50'
        : 'text-red-600 bg-red-50';

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-sm transition-shadow ${
        isDragging ? 'opacity-40' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#0E0E10]">{application.nom}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{application.role}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreClass}`}
        >
          <Star size={9} className="fill-current" />
          {score}/10
        </span>
      </div>
      {application.interview_date && (
        <p className="mt-2 text-[10px] font-medium text-amber-700">
          📅{' '}
          {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(
            new Date(application.interview_date),
          )}
        </p>
      )}
    </div>
  );
}

function DraggableCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { application },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <KanbanCard application={application} isDragging={isDragging} />
    </div>
  );
}

function DroppableColumn({
  column,
  applications,
  isOver,
}: {
  column: ColumnDef;
  applications: Application[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex min-w-[210px] flex-1 flex-col gap-2">
      <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${column.headerClass}`}>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{column.label}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold">{applications.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[160px] flex-col gap-2 rounded-xl border p-2 transition-all ${column.colClass} ${
          isOver ? 'ring-2 ring-[#F2600C]/40' : ''
        }`}
      >
        {applications.map((app) => (
          <DraggableCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="py-6 text-center text-[11px] text-[#D1D5DB]">Aucune candidature</p>
        )}
      </div>
    </div>
  );
}

type KanbanBoardProps = {
  applications: Application[];
  onStatusUpdated: (updated: UpdatedApplication) => void;
};

export default function KanbanBoard({ applications, onStatusUpdated }: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [overId, setOverId] = useState<ApplicationStatus | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, Application[]> = {
      pending: [],
      reviewing: [],
      interview: [],
      accepted: [],
      rejected: [],
    };
    for (const app of applications) {
      if (map[app.status]) map[app.status].push(app);
    }
    return map;
  }, [applications]);

  const promptInterviewDetails = useCallback(async (): Promise<{
    date: string;
    location: string;
  } | null> => {
    const { value } = await Alert.fire({
      title: "Planifier l'entretien",
      html: `
        <input id="swal-date" type="datetime-local" class="swal2-input" style="width:100%">
        <input id="swal-location" type="text" placeholder="Lieu (ex: Bureau, Teams…)" class="swal2-input" style="width:100%">
      `,
      confirmButtonText: 'Confirmer',
      confirmButtonColor: '#F2600C',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const date = (document.getElementById('swal-date') as HTMLInputElement)?.value;
        const location = (document.getElementById('swal-location') as HTMLInputElement)?.value ?? '';
        if (!date) {
          Alert.showValidationMessage('La date est obligatoire');
          return false;
        }
        return { date, location };
      },
    });
    return (value as { date: string; location: string } | undefined) ?? null;
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  };

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    setOverId((event.over?.id as ApplicationStatus) ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveApp(null);
    setOverId(null);

    const { active, over } = event;
    if (!over) return;

    const draggedApp = applications.find((a) => a.id === active.id);
    const newStatus = over.id as ApplicationStatus;

    if (!draggedApp || draggedApp.status === newStatus) return;

    let interviewDate: string | null = null;
    let interviewLocation: string | null = null;

    if (newStatus === 'interview') {
      const details = await promptInterviewDetails();
      if (!details) return;
      interviewDate = details.date;
      interviewLocation = details.location;
    }

    // Optimistic update
    onStatusUpdated({
      id: draggedApp.id,
      status: newStatus,
      status_label: LABEL_MAP[newStatus],
      status_color: 'gray',
      interview_date: interviewDate,
      interview_location: interviewLocation,
    });

    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (interviewDate) {
        body.interview_date = interviewDate;
        body.interview_location = interviewLocation;
      }

      const result = await apiFetch(`/applications/${draggedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      onStatusUpdated({
        id: draggedApp.id,
        status: result.status,
        status_label: result.status_label,
        status_color: result.status_color,
        interview_date: result.interview_date ?? interviewDate,
        interview_location: result.interview_location ?? interviewLocation,
      });
    } catch {
      // Revert to original
      onStatusUpdated({
        id: draggedApp.id,
        status: draggedApp.status,
        status_label: draggedApp.status_label,
        status_color: draggedApp.status_color,
        interview_date: draggedApp.interview_date,
        interview_location: draggedApp.interview_location,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.id}
            column={col}
            applications={grouped[col.id]}
            isOver={overId === col.id}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeApp ? (
          <div className="w-[210px] rotate-1 shadow-2xl">
            <KanbanCard application={activeApp} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
