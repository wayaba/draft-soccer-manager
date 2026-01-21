import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Player, Team, DraftState } from '../types'
import { api } from '../services/api'
import { useAuth } from './AuthContext'

interface DataContextType {
  // Data
  players: Player[]
  teams: Team[]
  draftState: DraftState
  isLoading: boolean

  // Actions
  loadData: () => Promise<void>
  addPlayer: (player: Player) => Promise<void>
  setPlayers: (players: Player[]) => void
  setTeams: (teams: Team[]) => void
  setDraftState: (draftState: DraftState) => Promise<void>
  handleStartDraft: (order: string[]) => Promise<void>
  reloadPlayers: () => Promise<void>
  reloadTeams: () => Promise<void>
  deletePlayer: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { session } = useAuth()
  const [players, setPlayersState] = useState<Player[]>([])
  const [teams, setTeamsState] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [draftState, setDraftStateLocal] = useState<DraftState>({
    isStarted: false,
    currentTurnIndex: 0,
    turnOrder: [],
    isSnakeReversed: false,
    history: []
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [p, t, d] = await Promise.all([api.getPlayers(), api.getTeams(), api.getDraftState()])
      setPlayersState(p || [])
      setTeamsState(t || [])
      if (d) setDraftStateLocal(d)
    } catch (error) {
      console.error('Error conectando con el backend:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPlayer = async (player: Player) => {
    const created = await api.createPlayer(player)
    setPlayersState((prev) => [...prev, created])
  }

  const deletePlayer = async (id: string) => {
    // Aquí iría api.deletePlayer(id)
    setPlayersState((p) => p.filter((x) => x.id !== id))
  }

  const setPlayers = (players: Player[]) => {
    setPlayersState(players)
  }

  const setTeams = (teams: Team[]) => {
    setTeamsState(teams)
  }

  const setDraftState = async (newState: DraftState) => {
    await api.saveDraftState(newState)
    setDraftStateLocal(newState)
  }

  const handleStartDraft = async (order: string[]) => {
    const newState = {
      ...draftState,
      isStarted: true,
      turnOrder: order
    }
    await api.saveDraftState(newState)
    setDraftStateLocal(newState)
  }

  const reloadPlayers = async () => {
    try {
      const players = await api.getPlayers()
      setPlayersState(players || [])
    } catch (error) {
      console.error('Error cargando jugadores:', error)
    }
  }

  const reloadTeams = async () => {
    try {
      const [players, teams] = await Promise.all([api.getPlayers(), api.getTeams()])
      setPlayersState(players || [])
      setTeamsState(teams || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  useEffect(() => {
    // Solo cargar datos si hay una sesión activa
    if (session) {
      loadData()
    }
  }, [session])

  const value: DataContextType = {
    players,
    teams,
    draftState,
    isLoading,
    loadData,
    addPlayer,
    setPlayers,
    setTeams,
    setDraftState,
    handleStartDraft,
    reloadPlayers,
    reloadTeams,
    deletePlayer
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
