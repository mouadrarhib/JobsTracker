import { useState } from 'react'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useContactsStore } from '../hooks/useContactsStore'
import type { ExportFormat, ExportScope } from '../utils/exportUtils'
import { applicationsToCsv, analyticsToCsv, buildExportJson, buildExportPdf, contactsToCsv, downloadFile } from '../utils/exportUtils'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

const SCOPE_OPTIONS: { key: keyof ExportScope; label: string; hint: string }[] = [
  { key: 'applications', label: 'Applications', hint: 'Every application you\'ve logged' },
  { key: 'contacts', label: 'Contacts', hint: 'Recruiters and managers you\'ve talked with' },
  { key: 'analytics', label: 'Analytics summary', hint: 'Funnel, resume performance, status breakdowns' },
]

const FORMAT_OPTIONS: { key: ExportFormat; label: string; hint: string }[] = [
  { key: 'json', label: 'JSON', hint: 'One file, machine-readable — best for backups or re-import' },
  { key: 'csv', label: 'CSV', hint: 'One spreadsheet file per data type you pick' },
  { key: 'pdf', label: 'PDF', hint: 'One readable report document' },
]

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { applications } = useApplicationsStore()
  const { contacts } = useContactsStore()
  const [scope, setScope] = useState<ExportScope>({ applications: true, contacts: false, analytics: false })
  const [format, setFormat] = useState<ExportFormat>('json')

  const anySelected = scope.applications || scope.contacts || scope.analytics
  const allSelected = scope.applications && scope.contacts && scope.analytics

  const toggleScope = (key: keyof ExportScope) => setScope((prev) => ({ ...prev, [key]: !prev[key] }))
  const selectAll = () => setScope({ applications: true, contacts: true, analytics: true })
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    const date = todayStamp()

    if (format === 'json') {
      const data = buildExportJson(scope, applications, contacts)
      downloadFile(`masar-export-${date}.json`, JSON.stringify(data, null, 2), 'application/json')
    }

    if (format === 'csv') {
      if (scope.applications) {
        downloadFile(`masar-applications-${date}.csv`, applicationsToCsv(applications), 'text/csv')
      }
      if (scope.contacts) {
        downloadFile(`masar-contacts-${date}.csv`, contactsToCsv(contacts, applications), 'text/csv')
      }
      if (scope.analytics) {
        downloadFile(`masar-analytics-${date}.csv`, analyticsToCsv(applications, contacts), 'text/csv')
      }
    }

    if (format === 'pdf') {
      setExporting(true)
      const doc = await buildExportPdf(scope, applications, contacts)
      doc.save(`masar-export-${date}.pdf`)
      setExporting(false)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-y-auto rounded-xl2 bg-paper-card p-6 shadow-panel max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-lg font-semibold text-ink">Export data</p>
        <p className="mt-1 text-sm text-ink-dim">Choose what to include and how you want the file.</p>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim/70">What to include</p>
            <button onClick={selectAll} className="text-xs font-medium text-cobalt hover:underline" disabled={allSelected}>
              Select all
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {SCOPE_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/8 px-3 py-2.5 transition hover:bg-paper-dim/50"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-cobalt"
                  checked={scope[opt.key]}
                  onChange={() => toggleScope(opt.key)}
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{opt.label}</span>
                  <span className="block text-xs text-ink-dim">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim/70">Format</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center transition ${
                  format === opt.key ? 'border-cobalt bg-cobalt/10' : 'border-ink/8 hover:bg-paper-dim/50'
                }`}
              >
                <input
                  type="radio"
                  name="export-format"
                  className="sr-only"
                  checked={format === opt.key}
                  onChange={() => setFormat(opt.key)}
                />
                <span className="block text-sm font-semibold text-ink">{opt.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-dim">{FORMAT_OPTIONS.find((f) => f.key === format)?.hint}</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-dim hover:bg-ink/5">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!anySelected || exporting}
            className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90 disabled:opacity-40"
          >
            {exporting ? 'Preparing PDF…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}
