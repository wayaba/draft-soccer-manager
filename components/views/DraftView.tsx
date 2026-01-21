import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import DraftBoard from '../DraftBoard'

export const DraftView: React.FC = () => {
  const { session } = useAuth()
  const { players, teams, draftState, setPlayers, setTeams, setDraftState } = useData()

  if (!session) {
    return null
  }

  const handleDraftStateChange = async (newState: any) => {
    // En un board real, llamaríamos a api.saveDraftState(newState)
    await setDraftState(newState)
  }

  return (
    <DraftBoard
      players={players}
      setPlayers={setPlayers}
      teams={teams}
      setTeams={setTeams}
      draftState={draftState}
      setDraftState={handleDraftStateChange}
      currentUser={session}
    />
  )
}
