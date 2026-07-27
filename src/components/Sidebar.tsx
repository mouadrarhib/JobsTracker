import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useApplicationsStore } from '../hooks/useApplicationsStore'
import { useDrawer } from '../hooks/useDrawer'
import { useAuth } from '../hooks/useAuth'
import { ExportModal } from './ExportModal'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/applications', label: 'Applications' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/analytics', label: 'Analytics' },
]

function StampMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-saffron">
      <span className="h-3.5 w-3.5 rounded-full bg-saffron" />
    </span>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  )
}

export function Sidebar() {
  const { applications } = useApplicationsStore()
  const { openCreate } = useDrawer()
  const { user, signOut } = useAuth()
  const [exportOpen, setExportOpen] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-ink px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-paper/80 transition hover:bg-white/10"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>
        <StampMark />
        <p className="font-display text-base font-semibold text-paper">Masār</p>
      </div>

      {!open && (
        <div
          className="fixed inset-y-0 left-0 z-40 hidden w-4 cursor-pointer md:block"
          onMouseEnter={() => setOpen(true)}
        >
          <div className="h-full w-1 bg-ink/40 transition hover:bg-saffron/70" />
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        onMouseLeave={() => setOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col bg-ink text-paper/90 shadow-panel transition-transform duration-200 ease-out sm:w-60 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 pb-6 pt-7">
          <StampMark />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-paper">Masār</p>
            <p className="text-[11px] uppercase tracking-wide text-paper/50">Job search log</p>
          </div>
        </div>

        <button
          onClick={() => {
            openCreate()
            setOpen(false)
          }}
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
              onClick={() => setOpen(false)}
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
            onClick={() => setExportOpen(true)}
            className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-paper/70 transition hover:border-white/30 hover:text-paper"
          >
            Export data...
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

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </>
  )
}
