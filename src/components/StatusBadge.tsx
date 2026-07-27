import type { Status } from '../types'
import { STATUS_META } from '../statusConfig'
import { StatusPill } from './StatusPill'

export function StatusBadge({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status]
  return <StatusPill label={meta.label} soft={meta.soft} dot={meta.dot} size={size} />
}
