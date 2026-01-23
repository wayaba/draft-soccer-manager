import React from 'react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { api } from '../../services/api'
import TeamSetup from '../TeamSetup'
import { Team } from '@/types'
import ConfirmationModal from '../ConfirmationModal'

export const TeamsView: React.FC = () => {
  const { session } = useAuth()

  // Estados para modal de confirmación de eliminación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleAddTeam = async (team: Team) => {
    await api.createTeam(team)
    setTeams((prev) => [...prev, team])
  }

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team)
    setIsConfirmModalOpen(true)
  }

  const handleRemoveTeam = async (team: Team) => {
    console.log('Eliminando equipo:', team)
    setIsDeleting(true)
    await api.deleteTeam(team.id)
    setTeams((prev) => prev.filter((t) => t.id !== team.id))
  }

  return (
    <>
      <TeamSetup
        players={players}
        setPlayers={setPlayers}
        teams={teams}
        onAddTeam={handleAddTeam}
        onRemoveTeam={handleDeleteClick}
        onStartDraft={handleStartDraft}
        resetDraft={() => {}}
        isDraftStarted={draftState.isStarted}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          handleRemoveTeam(teamToDelete)
          setIsConfirmModalOpen(false)
        }}
        title="Eliminar Equipo"
        message={`¿Estás seguro de eliminar el equipo: ${teamToDelete?.name}?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        type="warning"
        isLoading={isDeleting}
      />
    </>
  )
}
