import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Application } from '../types'
import { ScoreBadge } from './ScoreBadge'

export function KanbanCard({ application, onClick }: { application: Application; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`touch-none cursor-grab select-none rounded-xl border border-ink/8 bg-paper-card p-3.5 shadow-card transition active:cursor-grabbing ${
        isDragging ? 'opacity-40' : 'hover:border-ink/15 hover:shadow-panel'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight text-ink">{application.role}</p>
        <ScoreBadge score={application.score} size="sm" />
      </div>
      <p className="mt-1 text-xs text-ink-dim">{application.companyName}</p>
      {application.location && <p className="mt-2 text-[11px] text-ink-dim/70">{application.location}</p>}
    </div>
  )
}
