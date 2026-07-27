import type { Status } from './types'

interface StatusMeta {
  label: Status
  soft: string
  dot: string
}

// Colors follow the validated 8-slot categorical order from the dataviz skill
// (blue, orange, aqua, amber, magenta, green, red, violet) — CVD-safe adjacency
// when shown in this pipeline order. Do not reorder without re-validating.
export const STATUS_META: Record<Status, StatusMeta> = {
  Wishlist: { label: 'Wishlist', soft: 'bg-cobalt/10', dot: '#2A78D6' },
  Applied: { label: 'Applied', soft: 'bg-orange/10', dot: '#EB6834' },
  'Phone Screen': { label: 'Phone Screen', soft: 'bg-aqua/10', dot: '#1BAF7A' },
  Interview: { label: 'Interview', soft: 'bg-amber/10', dot: '#EDA100' },
  'Technical Test': { label: 'Technical Test', soft: 'bg-magenta/10', dot: '#E87BA4' },
  Offer: { label: 'Offer', soft: 'bg-green/10', dot: '#008300' },
  Rejected: { label: 'Rejected', soft: 'bg-red/10', dot: '#E34948' },
  Withdrawn: { label: 'Withdrawn', soft: 'bg-violet/10', dot: '#4A3AA7' },
}

export const ACTIVE_STATUSES: Status[] = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Technical Test',
]
