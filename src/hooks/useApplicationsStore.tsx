import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Application, ApplicationInput } from '../types'
import { dataService } from '../services/dataService'

interface ApplicationsStoreValue {
  applications: Application[]
  loading: boolean
  error: string | null
  addApplication: (input: ApplicationInput) => Promise<Application>
  updateApplication: (id: string, patch: Partial<ApplicationInput>) => Promise<Application>
  deleteApplication: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const ApplicationsContext = createContext<ApplicationsStoreValue | null>(null)

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Something went wrong loading your applications.'
}

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const apps = await dataService.getApplications()
      setApplications(apps)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addApplication = useCallback(async (input: ApplicationInput) => {
    const created = await dataService.addApplication(input)
    setApplications((prev) => [created, ...prev])
    return created
  }, [])

  const updateApplication = useCallback(async (id: string, patch: Partial<ApplicationInput>) => {
    const updated = await dataService.updateApplication(id, patch)
    setApplications((prev) => prev.map((app) => (app.id === id ? updated : app)))
    return updated
  }, [])

  const deleteApplication = useCallback(async (id: string) => {
    await dataService.deleteApplication(id)
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }, [])

  const value = useMemo(
    () => ({ applications, loading, error, addApplication, updateApplication, deleteApplication, refresh }),
    [applications, loading, error, addApplication, updateApplication, deleteApplication, refresh],
  )

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
}

export function useApplicationsStore() {
  const ctx = useContext(ApplicationsContext)
  if (!ctx) {
    throw new Error('useApplicationsStore must be used within an ApplicationsProvider')
  }
  return ctx
}
