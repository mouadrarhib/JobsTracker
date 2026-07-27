import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useDrawer } from '../hooks/useDrawer'
import { PageHeader } from '../components/PageHeader'
import { KanbanColumn } from '../components/KanbanColumn'
import { KanbanCard } from '../components/KanbanCard'
import { STATUSES } from '../types'
import type { Status } from '../types'

export function Pipeline() {
  const { applications, updateApplication } = useApplicationsStore()
  const { openView } = useDrawer()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const byStatus = useMemo(() => {
    const map = new Map<Status, typeof applications>()
    for (const status of STATUSES) map.set(status, [])
    for (const app of applications) map.get(app.status)?.push(app)
    return map
  }, [applications])

  const activeApplication = applications.find((a) => a.id === activeId)

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as Status
    const app = applications.find((a) => a.id === active.id)
    if (app && app.status !== newStatus) {
      updateApplication(app.id, { status: newStatus })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Pipeline" subtitle="Drag applications between stages as things move." />
      <div className="flex-1 overflow-x-auto px-4 py-6 md:px-8">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-4">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={byStatus.get(status) ?? []}
                onCardClick={openView}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApplication && <KanbanCard application={activeApplication} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
