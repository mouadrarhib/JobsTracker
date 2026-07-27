import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ApplicationDrawer } from './components/ApplicationDrawer'
import { MigrationBanner } from './components/MigrationBanner'
import { DataErrorBanner } from './components/DataErrorBanner'
import { ApplicationsProvider } from './hooks/useApplicationsStore'
import { DrawerProvider } from './hooks/useDrawer'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { ApplicationsTable } from './pages/ApplicationsTable'
import { Analytics } from './pages/Analytics'

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-ink" />
  }

  if (!user) {
    return <Login />
  }

  return (
    <ApplicationsProvider>
      <DrawerProvider>
        <div className="flex h-screen w-full flex-col overflow-hidden bg-paper">
          <DataErrorBanner />
          <MigrationBanner />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/applications" element={<ApplicationsTable />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </div>
        </div>
        <ApplicationDrawer />
      </DrawerProvider>
    </ApplicationsProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
