export function StatusPill({
  label,
  soft,
  dot,
  size = 'md',
}: {
  label: string
  soft: string
  dot: string
  size?: 'sm' | 'md'
}) {
  const padding = size === 'sm' ? 'py-0.5 pl-1 pr-2.5 text-[11px]' : 'py-1 pl-1.5 pr-3 text-xs'
  const dotSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium text-ink ${soft} ${padding}`}>
      <span
        className={`relative inline-flex ${dotSize} shrink-0 items-center justify-center rounded-full`}
        style={{ border: `1.5px dashed ${dot}` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
      </span>
      {label}
    </span>
  )
}
