import { useMemo, useState } from 'react'
import { useContactsStore } from '../hooks/useContactsStore'
import { useContactDrawer } from '../hooks/useContactDrawer'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { PageHeader } from '../components/PageHeader'

const inputClass =
  'rounded-lg border border-ink/10 bg-paper-card px-3 py-1.5 text-sm text-ink placeholder:text-ink-dim/40 focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/15'

export function Contacts() {
  const { contacts, loading } = useContactsStore()
  const { applications } = useApplicationsStore()
  const { openCreate, openView } = useContactDrawer()
  const [search, setSearch] = useState('')

  const applicationLabel = (id: string | null) => {
    if (!id) return null
    const app = applications.find((a) => a.id === id)
    return app ? `${app.companyName} — ${app.role}` : null
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.trim().toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q),
    )
  }, [contacts, search])

  if (loading) return null

  return (
    <div>
      <PageHeader title="Contacts" subtitle="Recruiters and managers you've talked with." />

      <div className="flex flex-wrap items-center justify-between gap-2.5 px-8 pt-5">
        <input
          className={`${inputClass} w-64`}
          placeholder="Search name, company, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {contacts.length > 0 && (
          <button
            onClick={() => openCreate()}
            className="rounded-lg bg-cobalt px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-cobalt/90"
          >
            + Log contact
          </button>
        )}
      </div>

      <div className="px-8 py-5">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink/15 py-24 text-center">
            <p className="font-display text-lg font-semibold text-ink">No contacts logged yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Log the recruiters and managers you talk to on LinkedIn, email, or the phone — who they are, how to
              reach them, and what you discussed.
            </p>
            <button
              onClick={() => openCreate()}
              className="mt-5 rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90"
            >
              + Log contact
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-dim">No contacts match your search.</p>
        ) : (
          <div className="overflow-hidden rounded-xl2 border border-ink/8 bg-paper-card shadow-card">
            <table className="w-full border-collapse">
              <thead className="border-b border-ink/8">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Company
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Linked application
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Contacted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => openView(contact.id)}
                    className="cursor-pointer transition hover:bg-paper-dim/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-ink">{contact.name}</td>
                    <td className="px-4 py-3 text-sm text-ink-dim">{contact.title || '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink-dim">{contact.company || '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink-dim">{applicationLabel(contact.applicationId) ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-dim">{contact.dateContacted || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
