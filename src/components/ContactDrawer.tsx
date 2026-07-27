import { useEffect, useState } from 'react'
import { useContactDrawer } from '../hooks/useContactDrawer'
import { useContactsStore } from '../hooks/useContactsStore'
import type { ContactInput } from '../types'
import { ContactForm } from './ContactForm'
import { ContactDetail } from './ContactDetail'

export function ContactDrawer() {
  const { state, close, openEdit, openView } = useContactDrawer()
  const { contacts, addContact, updateContact, deleteContact } = useContactsStore()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isOpen = state.mode !== 'closed'

  useEffect(() => {
    if (!isOpen) setConfirmingDelete(false)
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const contact =
    (state.mode === 'view' || state.mode === 'edit') ? contacts.find((c) => c.id === state.contactId) : undefined

  const handleCreate = async (input: ContactInput) => {
    const created = await addContact(input)
    openView(created.id)
  }

  const handleUpdate = async (input: ContactInput) => {
    if (state.mode !== 'edit') return
    await updateContact(state.contactId, input)
    openView(state.contactId)
  }

  const handleDelete = async () => {
    if (state.mode !== 'view' && state.mode !== 'edit') return
    await deleteContact(state.contactId)
    close()
  }

  let title = 'New contact'
  if (state.mode === 'view') title = 'Contact details'
  if (state.mode === 'edit') title = 'Edit contact'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={close} />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-paper-card shadow-panel animate-slide-in">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-dim">{title}</p>
          <button
            onClick={close}
            className="rounded-full p-1.5 text-ink-dim transition hover:bg-ink/5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {state.mode === 'create' && (
            <ContactForm
              defaultApplicationId={state.applicationId}
              onSubmit={handleCreate}
              onCancel={close}
              submitLabel="Save contact"
            />
          )}

          {state.mode === 'view' && contact && (
            <ContactDetail
              contact={contact}
              onEdit={() => openEdit(contact.id)}
              onDelete={() => setConfirmingDelete(true)}
            />
          )}

          {state.mode === 'edit' && contact && (
            <ContactForm
              initial={contact}
              onSubmit={handleUpdate}
              onCancel={() => openView(contact.id)}
              submitLabel="Save changes"
            />
          )}
        </div>
      </div>

      {confirmingDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/40 px-4" onClick={() => setConfirmingDelete(false)}>
          <div className="w-full max-w-80 rounded-xl2 bg-paper-card p-5 shadow-panel" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-sm font-semibold text-ink">Delete this contact?</p>
            <p className="mt-1 text-sm text-ink-dim">This can't be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-dim hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-critical px-3 py-1.5 text-sm font-semibold text-white hover:bg-critical/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
