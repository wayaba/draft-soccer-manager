import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

type View = 'players' | 'teams' | 'draft' | 'dashboard' | 'users'

export const useNavigation = () => {
  const { session } = useAuth()
  const { reloadPlayers, reloadTeams } = useData()

  // Inicializar vista basada en el rol del usuario
  const getInitialView = (): View => {
    if (!session) return 'dashboard'
    return session.role === 'ADMIN' ? 'dashboard' : 'draft'
  }

  const [view, setView] = useState<View>(getInitialView())

  // Actualizar vista cuando cambie la sesión
  useEffect(() => {
    setView(getInitialView())
  }, [session])

  const handleViewChange = async (newView: View) => {
    setView(newView)

    // Recargar datos cuando se accede a ciertas secciones
    if (newView === 'players' && session?.role === 'ADMIN') {
      await reloadPlayers()
    } else if (newView === 'teams' && session?.role === 'ADMIN') {
      await reloadTeams()
    } else if (newView === 'users' && session?.role === 'ADMIN') {
      await reloadPlayers()
    }
  }

  return {
    currentView: view,
    setView: handleViewChange
  }
}
