import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import PlayerRegistration from '../PlayerRegistration'

export const PlayersView: React.FC = () => {
  const { session } = useAuth()
  const { players, addPlayer, deletePlayer } = useData()

  if (!session || session.role !== 'ADMIN') {
    return null
  }

  return <PlayerRegistration players={players} onAddPlayer={addPlayer} onDeletePlayer={deletePlayer} />
}
