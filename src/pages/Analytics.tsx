import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useContactsStore } from '../hooks/useContactsStore'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { STATUSES, CONTACT_STATUSES } from '../types'
import { STATUS_META } from '../statusConfig'
import { CONTACT_STATUS_META } from '../contactStatusConfig'

const GRID = '#E1E0D9'
const AXIS_TEXT = { fill: '#898781', fontSize: 11, fontFamily: 'Inter, sans-serif' }
const CARD = 'rounded-xl2 border border-ink/8 bg-paper-card p-5 shadow-card'

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={CARD}>
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-ink-dim">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function TooltipBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-ink px-3 py-2 shadow-panel">
      <p className="text-[11px] font-medium text-paper/60">{label}</p>
      <p className="font-mono text-sm font-semibold text-paper">{value}</p>
    </div>
  )
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

export function Analytics() {
  const { applications, loading } = useApplicationsStore()
  const { contacts } = useContactsStore()

  const overTime = useMemo(() => {
    const submitted = applications.filter((a) => a.dateApplied).map((a) => a.dateApplied)
    if (submitted.length === 0) return []

    const sorted = [...submitted].sort()
    const start = weekStart(sorted[0])
    const end = weekStart(new Date().toISOString())

    const weeks: { key: string; label: string; date: Date }[] = []
    const cursor = new Date(start)
    while (cursor <= end) {
      weeks.push({ key: cursor.toISOString().slice(0, 10), label: formatWeekLabel(cursor), date: new Date(cursor) })
      cursor.setDate(cursor.getDate() + 7)
    }

    return weeks.map((week, i) => {
      const nextWeekStart = weeks[i + 1]?.date ?? new Date(8640000000000000)
      const cumulative = sorted.filter((d) => new Date(d) < nextWeekStart).length
      return { label: week.label, cumulative }
    })
  }, [applications])

  const statusBreakdown = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        count: applications.filter((a) => a.status === status).length,
        color: STATUS_META[status].dot,
      })),
    [applications],
  )

  const scoreDistribution = useMemo(() => {
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
  }, [applications])

  const contactStatusBreakdown = useMemo(
    () =>
      CONTACT_STATUSES.map((status) => ({
        status,
        count: contacts.filter((c) => c.status === status).length,
        color: CONTACT_STATUS_META[status].dot,
      })),
    [contacts],
  )

  const contactStats = useMemo(() => {
    const outbound = contacts.filter((c) => c.status !== 'Called Me')
    const resolved = outbound.filter((c) => c.status !== 'Reached Out')
    const responded = resolved.filter((c) => c.status !== 'No Response')
    const responseRate = resolved.length === 0 ? 0 : Math.round((responded.length / resolved.length) * 100)
    const interviewingMe = contacts.filter((c) => c.status === 'Interviewing Me').length

    return { total: contacts.length, responseRate, interviewingMe }
  }, [contacts])

  if (loading) return null

  if (applications.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Trends across your job search." />
        <div className="px-8 py-6">
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink/15 py-24 text-center">
            <p className="font-display text-lg font-semibold text-ink">Nothing to chart yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Log a few applications and this page fills in with your trends over time.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Trends across your job search." />
      <div className="space-y-5 px-8 py-6">
        <ChartCard title="Applications over time" subtitle="Cumulative applications submitted, by week">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={overTime} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A78D6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2A78D6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TEXT} axisLine={{ stroke: GRID }} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <TooltipBox label={label as string} value={`${payload[0].value} applications`} />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#2A78D6"
                strokeWidth={2}
                fill="url(#cumulativeFill)"
                dot={{ r: 3, fill: '#2A78D6', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#2A78D6', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title="Status breakdown" subtitle="Applications per pipeline stage">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={statusBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                barCategoryGap={10}
              >
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="status"
                  tick={{ ...AXIS_TEXT, fill: '#52514E' }}
                  axisLine={false}
                  tickLine={false}
                  width={92}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(27,36,48,0.04)' }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox label={payload[0].payload.status} value={`${payload[0].value} applications`} />
                    ) : null
                  }
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} label={{ position: 'right', ...AXIS_TEXT, fill: '#1B2430' }}>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Score distribution" subtitle="Match score across all applications">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scoreDistribution} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap={6}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ ...AXIS_TEXT, fontSize: 10 }} axisLine={{ stroke: GRID }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: 'rgba(27,36,48,0.04)' }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox label={`Score ${payload[0].payload.label}`} value={`${payload[0].value} applications`} />
                    ) : null
                  }
                />
                <Bar dataKey="count" fill="#2A78D6" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {contactStats.total > 0 && (
          <>
            <h2 className="pt-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-dim/70">
              Your network
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatCard label="Contacts logged" value={String(contactStats.total)} />
              <StatCard label="Response rate" value={`${contactStats.responseRate}%`} hint="People you reached out to" />
              <StatCard label="Interviewing me" value={String(contactStats.interviewingMe)} />
            </div>

            <ChartCard title="Contact status breakdown" subtitle="Where each relationship stands">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={contactStatusBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ ...AXIS_TEXT, fill: '#52514E' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(27,36,48,0.04)' }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TooltipBox label={payload[0].payload.status} value={`${payload[0].value} contacts`} />
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                    label={{ position: 'right', ...AXIS_TEXT, fill: '#1B2430' }}
                  >
                    {contactStatusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  )
}
