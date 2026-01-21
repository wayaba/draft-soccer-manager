import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider, useData } from './contexts/DataContext'
import { Layout } from './components/layout/Layout'
import { DashboardView, PlayersView, TeamsView, UsersView, DraftView } from './components/views'
import AuthFlow from './components/AuthFlow'
import { useNavigation } from './hooks/useNavigation'
import { RefreshCcw } from 'lucide-react'

const AppContent: React.FC = () => {
  const { session, login, isLoading: authLoading } = useAuth()
  const { players, addPlayer, isLoading: dataLoading } = useData()
  const { currentView, setView } = useNavigation()

  const isLoading = authLoading || dataLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <RefreshCcw className="animate-spin mb-4" size={48} />
        <p className="font-bold tracking-widest uppercase">Sincronizando con Base de Datos...</p>
      </div>
    )
  }

  if (!session) {
    return <AuthFlow onLogin={login} />
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'players':
        return <PlayersView />
      case 'teams':
        return <TeamsView />
      case 'users':
        return <UsersView />
      case 'draft':
        return <DraftView />
      default:
        return <DashboardView />
    }
  }

  return (
    <Layout currentView={currentView} onViewChange={setView}>
      {renderCurrentView()}
    </Layout>
  )
}

// Componente App principal con los providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
