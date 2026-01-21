import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import AdminUserManagement from '../AdminUserManagement'

export const UsersView: React.FC = () => {
  const { session } = useAuth()
  const { players, reloadPlayers } = useData()

  if (!session || session.role !== 'ADMIN') {
    return null
  }

  return <AdminUserManagement players={players} onPlayersUpdate={reloadPlayers} />
}
