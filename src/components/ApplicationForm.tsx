import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ApplicationInput, Status, Source } from '../types'
import { STATUSES, SOURCES } from '../types'
import { ScoreBadge } from './ScoreBadge'

const EMPTY_APPLICATION: ApplicationInput = {
  companyName: '',
  role: '',
  location: '',
  jobUrl: '',
  jobDescription: '',
  score: 50,
  status: 'Wishlist',
  dateApplied: new Date().toISOString().slice(0, 10),
  resumeVersion: '',
  coverLetterSent: false,
  contactPerson: '',
  salaryRange: '',
  notes: '',
  source: 'LinkedIn',
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

export function ApplicationForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: ApplicationInput
  onSubmit: (input: ApplicationInput) => void
  onCancel: () => void
  submitLabel: string
}) {
  const [values, setValues] = useState<ApplicationInput>(initial ?? EMPTY_APPLICATION)

  const set = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.companyName.trim() || !values.role.trim()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company">
            <input
              required
              autoFocus
              className={inputClass}
              value={values.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              placeholder="e.g. OCP Group"
            />
          </Field>
          <Field label="Role">
            <input
              required
              className={inputClass}
              value={values.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="e.g. Data Analyst"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <input
              className={inputClass}
              value={values.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Casablanca / Remote / Hybrid"
            />
          </Field>
          <Field label="Source">
            <select
              className={inputClass}
              value={values.source}
              onChange={(e) => set('source', e.target.value as Source)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Job posting URL">
          <input
            className={inputClass}
            value={values.jobUrl}
            onChange={(e) => set('jobUrl', e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select
              className={inputClass}
              value={values.status}
              onChange={(e) => set('status', e.target.value as Status)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date applied">
            <input
              type="date"
              className={inputClass}
              value={values.dateApplied}
              onChange={(e) => set('dateApplied', e.target.value)}
            />
          </Field>
        </div>

        <Field label={`Match score — ${values.score}/100`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={values.score}
              onChange={(e) => set('score', Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-cobalt"
            />
            <ScoreBadge score={values.score} />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Resume version">
            <input
              className={inputClass}
              value={values.resumeVersion}
              onChange={(e) => set('resumeVersion', e.target.value)}
              placeholder="Resume_v3_DataAnalyst"
            />
          </Field>
          <Field label="Cover letter sent">
            <select
              className={inputClass}
              value={values.coverLetterSent ? 'yes' : 'no'}
              onChange={(e) => set('coverLetterSent', e.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact person">
            <input
              className={inputClass}
              value={values.contactPerson}
              onChange={(e) => set('contactPerson', e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Salary range">
            <input
              className={inputClass}
              value={values.salaryRange}
              onChange={(e) => set('salaryRange', e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="Job description">
          <textarea
            rows={5}
            className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
            value={values.jobDescription}
            onChange={(e) => set('jobDescription', e.target.value)}
            placeholder="Paste the job description here"
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={4}
            className={`${inputClass} resize-none`}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Interview prep, impressions, follow-ups..."
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
