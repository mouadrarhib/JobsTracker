import { useMemo } from 'react'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useContactsStore } from '../hooks/useContactsStore'
import { useDrawer } from '../hooks/useDrawer'
import { PageHeader } from '../components/PageHeader'
import { ScoreBadge } from '../components/ScoreBadge'
import { StatusBadge } from '../components/StatusBadge'
import { StatCard } from '../components/StatCard'
import { ACTIVE_STATUSES } from '../statusConfig'

export function Dashboard() {
  const { applications, loading } = useApplicationsStore()
  const { contacts } = useContactsStore()
  const { openCreate, openView } = useDrawer()

  const stats = useMemo(() => {
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
  }, [applications])

  const networkStats = useMemo(() => {
    const interviewingMe = contacts.filter((c) => c.status === 'Interviewing Me').length
    const awaitingResponse = contacts.filter((c) => c.status === 'Reached Out').length
    const calledMe = contacts.filter((c) => c.status === 'Called Me').length

    const outbound = contacts.filter((c) => c.status !== 'Called Me')
    const resolved = outbound.filter((c) => c.status !== 'Reached Out')
    const responded = resolved.filter((c) => c.status !== 'No Response')
    const responseRate = resolved.length === 0 ? 0 : Math.round((responded.length / resolved.length) * 100)

    return { total: contacts.length, interviewingMe, awaitingResponse, calledMe, responseRate }
  }, [contacts])

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => (a.dateLastUpdated < b.dateLastUpdated ? 1 : -1))
        .slice(0, 6),
    [applications],
  )

  if (loading) return null

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your job search, at a glance." />

      <div className="px-8 py-6">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink/15 py-24 text-center">
            <p className="font-display text-lg font-semibold text-ink">Nothing logged yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Start by logging the first role you're going after. Every application you track here builds your picture of what's working.
            </p>
            <button
              onClick={openCreate}
              className="mt-5 rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90"
            >
              + Log application
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Total applications" value={String(stats.total)} />
              <StatCard label="Active" value={String(stats.active)} hint="In an open pipeline stage" />
              <StatCard label="Interviews this month" value={String(stats.interviewsThisMonth)} />
              <StatCard label="Average score" value={String(stats.averageScore)} hint="Match score out of 100" />
              <StatCard label="Response rate" value={`${stats.responseRate}%`} hint="Beyond initial application" />
            </div>

            {networkStats.total > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-dim/70">
                  Your network
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="Interviewing me" value={String(networkStats.interviewingMe)} />
                  <StatCard label="Awaiting response" value={String(networkStats.awaitingResponse)} />
                  <StatCard label="Called me first" value={String(networkStats.calledMe)} />
                  <StatCard label="Response rate" value={`${networkStats.responseRate}%`} hint="People you reached out to" />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-dim/70">
                Recently updated
              </h2>
              <div className="mt-3 divide-y divide-ink/8 rounded-xl2 border border-ink/8 bg-paper-card shadow-card">
                {recent.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openView(app.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition hover:bg-paper-dim/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{app.role}</p>
                      <p className="truncate text-xs text-ink-dim">{app.companyName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={app.status} size="sm" />
                      <ScoreBadge score={app.score} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
