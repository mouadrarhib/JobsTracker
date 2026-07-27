import type { ContactStatus } from '../types'
import { CONTACT_STATUS_META } from '../contactStatusConfig'
import { StatusPill } from './StatusPill'

export function ContactStatusBadge({ status, size = 'md' }: { status: ContactStatus; size?: 'sm' | 'md' }) {
  const meta = CONTACT_STATUS_META[status]
  return <StatusPill label={meta.label} soft={meta.soft} dot={meta.dot} size={size} />
}
