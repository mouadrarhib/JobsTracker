import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type ContactDrawerState =
  | { mode: 'closed' }
  | { mode: 'create'; applicationId: string | null }
  | { mode: 'view'; contactId: string }
  | { mode: 'edit'; contactId: string }

interface ContactDrawerContextValue {
  state: ContactDrawerState
  openCreate: (applicationId?: string | null) => void
  openView: (id: string) => void
  openEdit: (id: string) => void
  close: () => void
}

const ContactDrawerContext = createContext<ContactDrawerContextValue | null>(null)

export function ContactDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContactDrawerState>({ mode: 'closed' })

  const value = useMemo(
    () => ({
      state,
      openCreate: (applicationId: string | null = null) => setState({ mode: 'create', applicationId }),
      openView: (id: string) => setState({ mode: 'view', contactId: id }),
      openEdit: (id: string) => setState({ mode: 'edit', contactId: id }),
      close: () => setState({ mode: 'closed' }),
    }),
    [state],
  )

  return <ContactDrawerContext.Provider value={value}>{children}</ContactDrawerContext.Provider>
}

export function useContactDrawer() {
  const ctx = useContext(ContactDrawerContext)
  if (!ctx) throw new Error('useContactDrawer must be used within a ContactDrawerProvider')
  return ctx
}
