import type { Status } from '../types'
import { STATUS_META } from '../statusConfig'

export function StatusBadge({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status]
  const padding = size === 'sm' ? 'py-0.5 pl-1 pr-2.5 text-[11px]' : 'py-1 pl-1.5 pr-3 text-xs'
  const dotSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-ink ${meta.soft} ${padding}`}
    >
      <span
        className={`relative inline-flex ${dotSize} shrink-0 items-center justify-center rounded-full`}
        style={{ border: `1.5px dashed ${meta.dot}` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      </span>
      {meta.label}
    </span>
  )
}
