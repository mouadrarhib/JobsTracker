import type { Contact } from '../types'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useDrawer } from '../hooks/useDrawer'
import { useContactDrawer } from '../hooks/useContactDrawer'
import { ContactStatusBadge } from './ContactStatusBadge'

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  )
}

export function ContactDetail({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
}) {
  const { applications } = useApplicationsStore()
  const { openView: openApplication } = useDrawer()
  const { close: closeContactDrawer } = useContactDrawer()
  const linkedApplication = applications.find((a) => a.id === contact.applicationId)

  const handleOpenApplication = () => {
    if (!linkedApplication) return
    closeContactDrawer()
    openApplication(linkedApplication.id)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-6 py-6">
        <div>
          <p className="font-display text-xl font-semibold text-ink">{contact.name}</p>
          {contact.title && <p className="text-sm text-ink-dim">{contact.title}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ContactStatusBadge status={contact.status} />
        </div>

        {(contact.company || linkedApplication) && (
          <div className="flex flex-wrap items-center gap-2">
            {contact.company && (
              <span className="inline-flex items-center rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-dim">
                {contact.company}
              </span>
            )}
            {linkedApplication && (
              <button
                onClick={handleOpenApplication}
                className="inline-flex items-center gap-1 rounded-full bg-cobalt/10 px-3 py-1 text-xs font-medium text-cobalt transition hover:bg-cobalt/20"
              >
                {linkedApplication.role} application ↗
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <Row label="Date contacted" value={contact.dateContacted} />
          <Row label="Last updated" value={contact.dateLastUpdated} />
        </div>

        {contact.linkedinUrl && (
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-dim transition hover:bg-ink/10"
          >
            View LinkedIn profile ↗
          </a>
        )}

        {contact.notes && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{contact.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-ink/10 bg-paper-card px-6 py-4">
        <button
          onClick={onDelete}
          className="rounded-lg px-3 py-2 text-sm font-medium text-critical transition hover:bg-critical/10"
        >
          Delete
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-soft"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
