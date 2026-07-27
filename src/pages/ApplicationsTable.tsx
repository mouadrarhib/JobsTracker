import { useMemo, useState } from 'react'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useDrawer } from '../hooks/useDrawer'
import { PageHeader } from '../components/PageHeader'
import { ScoreBadge } from '../components/ScoreBadge'
import { StatusBadge } from '../components/StatusBadge'
import { STATUSES } from '../types'
import type { Application, Status } from '../types'

type SortKey = 'companyName' | 'role' | 'score' | 'dateApplied' | 'location'
type SortDir = 'asc' | 'desc'

const inputClass =
  'rounded-lg border border-ink/10 bg-paper-card px-3 py-1.5 text-sm text-ink placeholder:text-ink-dim/40 focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/15'

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
}) {
  const active = currentKey === sortKey
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="cursor-pointer select-none px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70 hover:text-ink"
    >
      {label} {active && (currentDir === 'asc' ? '↑' : '↓')}
    </th>
  )
}

export function ApplicationsTable() {
  const { applications, loading } = useApplicationsStore()
  const { openView, openCreate } = useDrawer()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [locationFilter, setLocationFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('dateApplied')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result: Application[] = applications

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (a) => a.companyName.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'All') {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (locationFilter.trim()) {
      const q = locationFilter.trim().toLowerCase()
      result = result.filter((a) => a.location.toLowerCase().includes(q))
    }
    if (dateFrom) {
      result = result.filter((a) => a.dateApplied && a.dateApplied >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((a) => a.dateApplied && a.dateApplied <= dateTo)
    }

    const sorted = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })

    return sorted
  }, [applications, search, statusFilter, locationFilter, dateFrom, dateTo, sortKey, sortDir])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setLocationFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = search || statusFilter !== 'All' || locationFilter || dateFrom || dateTo

  if (loading) return null

  return (
    <div>
      <PageHeader title="Applications" subtitle={`${filtered.length} of ${applications.length} shown`} />

      <div className="flex flex-wrap items-center gap-2.5 px-8 pt-5">
        <input
          className={`${inputClass} w-56`}
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={inputClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className={`${inputClass} w-36`}
          placeholder="Location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <div className="flex items-center gap-1.5 text-xs text-ink-dim">
          <input type="date" className={inputClass} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span>to</span>
          <input type="date" className={inputClass} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-cobalt hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="px-8 py-5">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink/15 py-24 text-center">
            <p className="font-display text-lg font-semibold text-ink">No applications yet</p>
            <button
              onClick={openCreate}
              className="mt-5 rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90"
            >
              + Log application
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-dim">No applications match these filters.</p>
        ) : (
          <div className="overflow-hidden rounded-xl2 border border-ink/8 bg-paper-card shadow-card">
            <table className="w-full border-collapse">
              <thead className="border-b border-ink/8">
                <tr>
                  <SortHeader label="Company" sortKey="companyName" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Role" sortKey="role" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Location" sortKey="location" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-dim/70">
                    Status
                  </th>
                  <SortHeader label="Score" sortKey="score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Applied" sortKey="dateApplied" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openView(app.id)}
                    className="cursor-pointer transition hover:bg-paper-dim/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-ink">{app.companyName}</td>
                    <td className="px-4 py-3 text-sm text-ink-dim">{app.role}</td>
                    <td className="px-4 py-3 text-sm text-ink-dim">{app.location || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={app.score} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-dim">{app.dateApplied || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
