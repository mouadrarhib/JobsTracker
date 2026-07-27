import { useState } from 'react'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { dataService } from '../services/dataService'
import type { Application } from '../types'

const STORAGE_KEY = 'masar_applications_v1'
const MIGRATED_FLAG = 'masar_migration_done_v1'

function readLocalApplications(): Application[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Application[]
  } catch {
    return []
  }
}

export function MigrationBanner() {
  const { refresh } = useApplicationsStore()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(MIGRATED_FLAG) === 'true')
  const [status, setStatus] = useState<'idle' | 'importing' | 'error'>('idle')
  const [error, setError] = useState('')

  const localApplications = readLocalApplications()

  if (dismissed || localApplications.length === 0) return null

  const dismiss = () => {
    localStorage.setItem(MIGRATED_FLAG, 'true')
    setDismissed(true)
  }

  const handleImport = async () => {
    setStatus('importing')
    setError('')
    try {
      await dataService.importAll(localApplications)
      await refresh()
      dismiss()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber/30 bg-amber/10 px-8 py-3">
      <div>
        <p className="text-sm font-medium text-ink">
          Found {localApplications.length} application{localApplications.length === 1 ? '' : 's'} saved locally from
          before.
        </p>
        <p className="text-xs text-ink-dim">Import them into your account so they show up here too.</p>
        {status === 'error' && <p className="mt-1 text-xs text-critical">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={dismiss}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-dim hover:bg-ink/5"
        >
          Dismiss
        </button>
        <button
          onClick={handleImport}
          disabled={status === 'importing'}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink-soft disabled:opacity-60"
        >
          {status === 'importing' ? 'Importing…' : 'Import now'}
        </button>
      </div>
    </div>
  )
}
