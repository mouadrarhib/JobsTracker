import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ContactInput } from '../types'
import { useApplicationsStore } from '../hooks/useApplicationsStore'

function emptyContact(applicationId: string | null): ContactInput {
  return {
    name: '',
    title: '',
    company: '',
    linkedinUrl: '',
    email: '',
    phone: '',
    applicationId,
    dateContacted: new Date().toISOString().slice(0, 10),
    notes: '',
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-dim">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'rounded-lg border border-ink/10 bg-paper-card px-3 py-2 text-sm text-ink placeholder:text-ink-dim/40 focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/15'

export function ContactForm({
  initial,
  defaultApplicationId = null,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: ContactInput
  defaultApplicationId?: string | null
  onSubmit: (input: ContactInput) => void
  onCancel: () => void
  submitLabel: string
}) {
  const { applications } = useApplicationsStore()
  const [values, setValues] = useState<ContactInput>(initial ?? emptyContact(defaultApplicationId))

  const set = <K extends keyof ContactInput>(key: K, value: ContactInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.name.trim()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input
              required
              autoFocus
              className={inputClass}
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Yasmine Alaoui"
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass}
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Talent Acquisition"
            />
          </Field>
        </div>

        <Field label="Company">
          <input
            className={inputClass}
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="e.g. OCP Group"
          />
        </Field>

        <Field label="Linked application">
          <select
            className={inputClass}
            value={values.applicationId ?? ''}
            onChange={(e) => set('applicationId', e.target.value || null)}
          >
            <option value="">None</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.companyName} — {app.role}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={values.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="LinkedIn profile">
          <input
            className={inputClass}
            value={values.linkedinUrl}
            onChange={(e) => set('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </Field>

        <Field label="Date contacted">
          <input
            type="date"
            className={inputClass}
            value={values.dateContacted}
            onChange={(e) => set('dateContacted', e.target.value)}
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={5}
            className={`${inputClass} resize-none`}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="How you connected, what was discussed, follow-ups..."
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-ink/10 bg-paper-card px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-dim transition hover:bg-ink/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
