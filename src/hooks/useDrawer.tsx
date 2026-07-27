import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type DrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'view'; applicationId: string }
  | { mode: 'edit'; applicationId: string }

interface DrawerContextValue {
  state: DrawerState
  openCreate: () => void
  openView: (id: string) => void
  openEdit: (id: string) => void
  close: () => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>({ mode: 'closed' })

  const value = useMemo(
    () => ({
      state,
      openCreate: () => setState({ mode: 'create' }),
      openView: (id: string) => setState({ mode: 'view', applicationId: id }),
      openEdit: (id: string) => setState({ mode: 'edit', applicationId: id }),
      close: () => setState({ mode: 'closed' }),
    }),
    [state],
  )

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be used within a DrawerProvider')
  return ctx
}
