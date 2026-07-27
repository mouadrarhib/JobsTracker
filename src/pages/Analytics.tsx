import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useContactsStore } from '../hooks/useContactsStore'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import {
  computeContactStatusBreakdown,
  computeContactSummary,
  computeFunnel,
  computeOverTime,
  computeResumeStats,
  computeScoreDistribution,
  computeStatusBreakdown,
} from '../utils/analytics'

const GRID = '#E1E0D9'
const AXIS_TEXT = { fill: '#898781', fontSize: 11, fontFamily: 'Inter, sans-serif' }
const CARD = 'rounded-xl2 border border-ink/8 bg-paper-card p-4 shadow-card md:p-5'

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

export function Analytics() {
  const { applications, loading } = useApplicationsStore()
  const { contacts } = useContactsStore()

  const overTime = useMemo(() => computeOverTime(applications), [applications])
  const statusBreakdown = useMemo(() => computeStatusBreakdown(applications), [applications])
  const scoreDistribution = useMemo(() => computeScoreDistribution(applications), [applications])
  const funnel = useMemo(() => computeFunnel(applications), [applications])
  const resumeStats = useMemo(() => computeResumeStats(applications), [applications])
  const contactStatusBreakdown = useMemo(() => computeContactStatusBreakdown(contacts), [contacts])
  const contactStats = useMemo(() => computeContactSummary(contacts), [contacts])

  if (loading) return null

  if (applications.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Trends across your job search." />
        <div className="px-4 py-6 md:px-8">
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
      <div className="space-y-5 px-4 py-6 md:px-8">
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

        <ChartCard title="Funnel" subtitle="Of everything you've applied to, how far it got">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={funnel}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              barCategoryGap={12}
            >
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ ...AXIS_TEXT, fill: '#52514E' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'rgba(27,36,48,0.04)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      label={payload[0].payload.label}
                      value={`${payload[0].payload.count} applications (${payload[0].payload.pct}%)`}
                    />
                  ) : null
                }
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {funnel.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, index } = props as {
                      x: number
                      y: number
                      width: number
                      height: number
                      index: number
                    }
                    const stage = funnel[index]
                    if (!stage) return null
                    return (
                      <text
                        x={x + width + 8}
                        y={y + height / 2}
                        dy={4}
                        fontSize={11}
                        fill="#1B2430"
                        fontFamily="Inter, sans-serif"
                      >
                        {stage.count} ({stage.pct}%)
                      </text>
                    )
                  }}
                />
              </Bar>
            </BarChart>
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

        {resumeStats.rows.length > 0 && (
          <ChartCard title="Resume performance" subtitle="Response, interview, and offer rate by resume version">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-ink/8">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                      Resume version
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                      Applied
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                      Response rate
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                      Interview rate
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                      Offers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {resumeStats.rows.map((row) => (
                    <tr key={row.version}>
                      <td className="px-3 py-2.5 text-sm font-medium text-ink">{row.version}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm text-ink-dim">{row.applied}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm text-ink-dim">{row.responseRate}%</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm text-ink-dim">{row.interviewRate}%</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm text-ink-dim">{row.offers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {resumeStats.unspecified > 0 && (
              <p className="mt-3 text-xs text-ink-dim">
                {resumeStats.unspecified} application{resumeStats.unspecified === 1 ? '' : 's'} without a resume
                version logged aren't included above.
              </p>
            )}
          </ChartCard>
        )}

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
