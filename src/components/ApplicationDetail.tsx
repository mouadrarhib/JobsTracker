import type { Application } from '../types'
import { ScoreBadge } from './ScoreBadge'
import { StatusBadge } from './StatusBadge'
import { useContactsStore } from '../hooks/useContactsStore'
import { useContactDrawer } from '../hooks/useContactDrawer'
import { useDrawer } from '../hooks/useDrawer'

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  )
}

export function ApplicationDetail({
  application,
  onEdit,
  onDelete,
}: {
  application: Application
  onEdit: () => void
  onDelete: () => void
}) {
  const { contacts } = useContactsStore()
  const { openCreate: openCreateContact, openView: openViewContact } = useContactDrawer()
  const { close: closeApplicationDrawer } = useDrawer()
  const linkedContacts = contacts.filter((c) => c.applicationId === application.id)

  const handleOpenContact = (id: string) => {
    closeApplicationDrawer()
    openViewContact(id)
  }

  const handleAddContact = () => {
    closeApplicationDrawer()
    openCreateContact(application.id)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-semibold text-ink">{application.role}</p>
            <p className="text-sm text-ink-dim">{application.companyName}</p>
          </div>
          <ScoreBadge score={application.score} size="lg" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={application.status} />
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-dim transition hover:bg-ink/10"
            >
              Open posting ↗
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row label="Location" value={application.location} />
          <Row label="Source" value={application.source} />
          <Row label="Date applied" value={application.dateApplied} />
          <Row label="Last updated" value={application.dateLastUpdated} />
          <Row label="Resume version" value={application.resumeVersion} />
          <Row label="Cover letter sent" value={application.coverLetterSent ? 'Yes' : 'No'} />
          <Row label="Contact person" value={application.contactPerson} />
          <Row label="Salary range" value={application.salaryRange} />
        </div>

        {application.jobDescription && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">Job description</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-paper-dim px-3 py-2.5 font-mono text-xs leading-relaxed text-ink-dim">
              {application.jobDescription}
            </p>
          </div>
        )}

        {application.notes && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{application.notes}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim/60">Contacts</p>
            <button onClick={handleAddContact} className="text-xs font-medium text-cobalt hover:underline">
              + Add contact
            </button>
          </div>
          {linkedContacts.length === 0 ? (
            <p className="mt-1.5 text-sm text-ink-dim">No one logged for this application yet.</p>
          ) : (
            <div className="mt-1.5 space-y-1.5">
              {linkedContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleOpenContact(contact.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink/8 px-3 py-2 text-left transition hover:bg-paper-dim/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{contact.name}</p>
                    {contact.title && <p className="truncate text-xs text-ink-dim">{contact.title}</p>}
                  </div>
                  {contact.dateContacted && (
                    <span className="shrink-0 font-mono text-[11px] text-ink-dim/70">{contact.dateContacted}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
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
