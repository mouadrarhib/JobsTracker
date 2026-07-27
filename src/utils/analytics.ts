import type { Application, Contact } from '../types'
import { STATUSES, CONTACT_STATUSES } from '../types'
import { STATUS_META, ACTIVE_STATUSES } from '../statusConfig'
import { CONTACT_STATUS_META } from '../contactStatusConfig'

// Ordinal blue ramp (steps 250/350/450/550/650) for the funnel — stages are ordered
// progress, not independent categories, so one hue light-to-dark per the dataviz skill.
const FUNNEL_RAMP = ['#86B6EF', '#5598E7', '#2A78D6', '#1C5CAB', '#104281']
const FUNNEL_STAGES = [
  { label: 'Applied', statuses: ['Applied', 'Phone Screen', 'Interview', 'Technical Test', 'Offer', 'Rejected', 'Withdrawn'] },
  { label: 'Phone Screen+', statuses: ['Phone Screen', 'Interview', 'Technical Test', 'Offer'] },
  { label: 'Interview+', statuses: ['Interview', 'Technical Test', 'Offer'] },
  { label: 'Technical Test+', statuses: ['Technical Test', 'Offer'] },
  { label: 'Offer', statuses: ['Offer'] },
] as const

export interface ApplicationSummary {
  total: number
  active: number
  interviewsThisMonth: number
  averageScore: number
  responseRate: number
}

export function computeApplicationSummary(applications: Application[]): ApplicationSummary {
  const total = applications.length
  const active = applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length

  const now = new Date()
  const interviewsThisMonth = applications.filter((a) => {
    if (a.status !== 'Interview') return false
    const d = new Date(a.dateLastUpdated)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const averageScore = total === 0 ? 0 : Math.round(applications.reduce((sum, a) => sum + a.score, 0) / total)

  const submitted = applications.filter((a) => a.status !== 'Wishlist')
  const responded = submitted.filter((a) => a.status !== 'Applied')
  const responseRate = submitted.length === 0 ? 0 : Math.round((responded.length / submitted.length) * 100)

  return { total, active, interviewsThisMonth, averageScore, responseRate }
}

function weekStart(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekLabel(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function computeOverTime(applications: Application[]): { label: string; cumulative: number }[] {
  const submitted = applications.filter((a) => a.dateApplied).map((a) => a.dateApplied)
  if (submitted.length === 0) return []

  const sorted = [...submitted].sort()
  const start = weekStart(sorted[0])
  const end = weekStart(new Date().toISOString())

  const weeks: { label: string; date: Date }[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    weeks.push({ label: formatWeekLabel(cursor), date: new Date(cursor) })
    cursor.setDate(cursor.getDate() + 7)
  }

  return weeks.map((week, i) => {
    const nextWeekStart = weeks[i + 1]?.date ?? new Date(8640000000000000)
    const cumulative = sorted.filter((d) => new Date(d) < nextWeekStart).length
    return { label: week.label, cumulative }
  })
}

export interface StatusBreakdownEntry {
  status: string
  count: number
  color: string
}

export function computeStatusBreakdown(applications: Application[]): StatusBreakdownEntry[] {
  return STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
    color: STATUS_META[status].dot,
  }))
}

export interface ScoreBucket {
  label: string
  min: number
  max: number
  count: number
}

export function computeScoreDistribution(applications: Application[]): ScoreBucket[] {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    label: i === 9 ? '90–100' : `${i * 10}–${i * 10 + 9}`,
    min: i * 10,
    max: i === 9 ? 100 : i * 10 + 9,
    count: 0,
  }))
  for (const app of applications) {
    const idx = Math.min(9, Math.floor(app.score / 10))
    buckets[idx].count += 1
  }
  return buckets
}

export interface FunnelStage {
  label: string
  count: number
  pct: number
  color: string
}

export function computeFunnel(applications: Application[]): FunnelStage[] {
  const submitted = applications.filter((a) => a.status !== 'Wishlist')
  const total = submitted.length
  return FUNNEL_STAGES.map((stage, i) => {
    const count = submitted.filter((a) => (stage.statuses as readonly string[]).includes(a.status)).length
    return {
      label: stage.label,
      count,
      pct: total === 0 ? 0 : Math.round((count / total) * 100),
      color: FUNNEL_RAMP[i],
    }
  })
}

export interface ResumeStatsRow {
  version: string
  applied: number
  responseRate: number
  interviewRate: number
  offers: number
}

export function computeResumeStats(applications: Application[]): { rows: ResumeStatsRow[]; unspecified: number } {
  const groups = new Map<string, Application[]>()
  for (const app of applications) {
    const key = app.resumeVersion.trim()
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(app)
  }

  const rows = Array.from(groups.entries()).map(([version, apps]) => {
    const submitted = apps.filter((a) => a.status !== 'Wishlist')
    const responded = submitted.filter((a) => a.status !== 'Applied')
    const interviewPlus = submitted.filter((a) => ['Interview', 'Technical Test', 'Offer'].includes(a.status))
    const offers = submitted.filter((a) => a.status === 'Offer')
    return {
      version,
      applied: submitted.length,
      responseRate: submitted.length === 0 ? 0 : Math.round((responded.length / submitted.length) * 100),
      interviewRate: submitted.length === 0 ? 0 : Math.round((interviewPlus.length / submitted.length) * 100),
      offers: offers.length,
    }
  })
  rows.sort((a, b) => b.applied - a.applied)

  const trackedCount = Array.from(groups.values()).reduce((sum, apps) => sum + apps.length, 0)
  const unspecified = applications.length - trackedCount

  return { rows, unspecified }
}

export interface ContactStatusBreakdownEntry {
  status: string
  count: number
  color: string
}

export function computeContactStatusBreakdown(contacts: Contact[]): ContactStatusBreakdownEntry[] {
  return CONTACT_STATUSES.map((status) => ({
    status,
    count: contacts.filter((c) => c.status === status).length,
    color: CONTACT_STATUS_META[status].dot,
  }))
}

export interface ContactSummary {
  total: number
  responseRate: number
  interviewingMe: number
  awaitingResponse: number
  calledMe: number
}

export function computeContactSummary(contacts: Contact[]): ContactSummary {
  const outbound = contacts.filter((c) => c.status !== 'Called Me')
  const resolved = outbound.filter((c) => c.status !== 'Reached Out')
  const responded = resolved.filter((c) => c.status !== 'No Response')
  const responseRate = resolved.length === 0 ? 0 : Math.round((responded.length / resolved.length) * 100)
  const interviewingMe = contacts.filter((c) => c.status === 'Interviewing Me').length
  const awaitingResponse = contacts.filter((c) => c.status === 'Reached Out').length
  const calledMe = contacts.filter((c) => c.status === 'Called Me').length

  return { total: contacts.length, responseRate, interviewingMe, awaitingResponse, calledMe }
}
