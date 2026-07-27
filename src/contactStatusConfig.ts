import type { ContactStatus } from './types'

interface ContactStatusMeta {
  label: ContactStatus
  soft: string
  dot: string
}

// Same validated 8-slot categorical order as statusConfig.ts (blue, orange, aqua,
// amber, magenta, green, red, violet) — reused here in the same sequence/positions
// so CVD-safe adjacency still holds. Only the labels differ; do not reorder the hexes.
export const CONTACT_STATUS_META: Record<ContactStatus, ContactStatusMeta> = {
  'Reached Out': { label: 'Reached Out', soft: 'bg-cobalt/10', dot: '#2A78D6' },
  'Called Me': { label: 'Called Me', soft: 'bg-orange/10', dot: '#EB6834' },
  Responded: { label: 'Responded', soft: 'bg-aqua/10', dot: '#1BAF7A' },
  'Referred Me': { label: 'Referred Me', soft: 'bg-amber/10', dot: '#EDA100' },
  Cold: { label: 'Cold', soft: 'bg-magenta/10', dot: '#E87BA4' },
  'Interviewing Me': { label: 'Interviewing Me', soft: 'bg-green/10', dot: '#008300' },
  'No Response': { label: 'No Response', soft: 'bg-red/10', dot: '#E34948' },
}
