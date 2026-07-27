import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useContactsStore } from '../hooks/useContactsStore'

function ErrorRow({
  label,
  error,
  migrationFile,
  onRetry,
}: {
  label: string
  error: string
  migrationFile: string
  onRetry: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-critical/30 bg-critical/10 px-8 py-3">
      <div>
        <p className="text-sm font-medium text-ink">Couldn't load your {label}.</p>
        <p className="text-xs text-ink-dim">
          {error}. If you haven't run <code className="font-mono">{migrationFile}</code> in your Supabase SQL editor
          yet, that's likely why — do that, then retry.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink-soft"
      >
        Retry
      </button>
    </div>
  )
}

export function DataErrorBanner() {
  const applications = useApplicationsStore()
  const contacts = useContactsStore()

  return (
    <>
      {applications.error && (
        <ErrorRow
          label="applications"
          error={applications.error}
          migrationFile="supabase/schema.sql"
          onRetry={() => applications.refresh()}
        />
      )}
      {contacts.error && (
        <ErrorRow
          label="contacts"
          error={contacts.error}
          migrationFile="supabase/contacts.sql"
          onRetry={() => contacts.refresh()}
        />
      )}
    </>
  )
}
