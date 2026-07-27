export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl2 border border-ink/8 bg-paper-card p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-dim/70">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-dim">{hint}</p>}
    </div>
  )
}
