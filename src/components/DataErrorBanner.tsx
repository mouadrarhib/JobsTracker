import { useApplicationsStore } from '../hooks/useApplicationsStore'

export function DataErrorBanner() {
  const { error, refresh } = useApplicationsStore()

  if (!error) return null

  return (
    <div className="flex items-center justify-between gap-4 border-b border-critical/30 bg-critical/10 px-8 py-3">
      <div>
        <p className="text-sm font-medium text-ink">Couldn't load your applications.</p>
        <p className="text-xs text-ink-dim">
          {error}. If you haven't run <code className="font-mono">supabase/schema.sql</code> in your Supabase SQL
          editor yet, that's likely why — do that, then retry.
        </p>
      </div>
      <button
        onClick={() => refresh()}
        className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink-soft"
      >
        Retry
      </button>
    </div>
  )
}
