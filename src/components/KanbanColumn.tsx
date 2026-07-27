import { useDroppable } from '@dnd-kit/core'
import type { Application, Status } from '../types'
import { STATUS_META } from '../statusConfig'
import { KanbanCard } from './KanbanCard'

export function KanbanColumn({
  status,
  applications,
  onCardClick,
}: {
  status: Status
  applications: Application[]
  onCardClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl2 border border-ink/8 bg-paper-dim/60 transition ${
        isOver ? 'ring-2 ring-cobalt/40' : ''
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} />
          <p className="text-sm font-semibold text-ink">{status}</p>
        </div>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[11px] text-ink-dim">
          {applications.length}
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto scrollbar-thin px-3 py-4">
        {applications.map((app) => (
          <KanbanCard key={app.id} application={app} onClick={() => onCardClick(app.id)} />
        ))}
        {applications.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-ink-dim/50">Drop applications here</p>
        )}
      </div>
    </div>
  )
}
