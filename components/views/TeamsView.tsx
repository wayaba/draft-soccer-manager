import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { api } from '../../services/api'
import TeamSetup from '../TeamSetup'

export const TeamsView: React.FC = () => {
  const { session } = useAuth()
  const { players, teams, setPlayers, setTeams, handleStartDraft, draftState } = useData()

  if (!session || session.role !== 'ADMIN') {
    return null
  }

  const handleTeamsUpdate = async (newTeams: any) => {
    // Sincronizar con API
    const latestTeam = (newTeams as any[])[newTeams.length - 1]
    if (latestTeam) await api.createTeam(latestTeam)
    setTeams(newTeams)
  }

  return (
    <TeamSetup
      players={players}
      setPlayers={setPlayers}
      teams={teams}
      setTeams={handleTeamsUpdate}
      onStartDraft={handleStartDraft}
      resetDraft={() => {}}
      isDraftStarted={draftState.isStarted}
    />
  )
}
