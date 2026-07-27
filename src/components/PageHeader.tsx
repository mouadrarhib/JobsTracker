export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-ink/8 px-4 py-5 md:px-8 md:py-6">
      <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>}
    </div>
  )
}
