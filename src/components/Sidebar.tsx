import { NavLink } from 'react-router-dom'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useDrawer } from '../hooks/useDrawer'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/applications', label: 'Applications' },
  { to: '/analytics', label: 'Analytics' },
]

function StampMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron">
      <span className="h-3.5 w-3.5 rounded-full bg-saffron" />
    </span>
  )
}

async function handleExport() {
  const applications = await dataService.exportAll()
  const blob = new Blob([JSON.stringify(applications, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `masar-applications-${date}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function Sidebar() {
  const { applications } = useApplicationsStore()
  const { openCreate } = useDrawer()
  const { user, signOut } = useAuth()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-ink text-paper/90">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-7">
        <StampMark />
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-paper">Masār</p>
          <p className="text-[11px] uppercase tracking-wide text-paper/50">Job search log</p>
        </div>
      </div>

      <button
        onClick={openCreate}
        className="mx-4 mb-6 rounded-lg bg-saffron px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-saffron/90 active:scale-[0.98]"
      >
        + Log application
      </button>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper/90'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 px-4 py-5">
        <p className="text-[11px] text-paper/40">
          {applications.length} application{applications.length === 1 ? '' : 's'} logged
        </p>
        <button
          onClick={handleExport}
          className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-paper/70 transition hover:border-white/30 hover:text-paper"
        >
          Export data as JSON
        </button>
        {user && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="truncate text-[11px] text-paper/40" title={user.email}>
              {user.email}
            </p>
            <button
              onClick={signOut}
              className="shrink-0 text-[11px] font-medium text-paper/50 hover:text-paper/80"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
