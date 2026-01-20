import React, { useState, useEffect } from 'react'
import { Player, Team, DraftState, AuthSession } from './types'
import PlayerRegistration from './components/PlayerRegistration'
import TeamSetup from './components/TeamSetup'
import DraftBoard from './components/DraftBoard'
import Login from './components/Login'
import { api } from './services/api'
import { UserPlus, Users, Trophy, LayoutDashboard, LogOut, ShieldCheck, User, RefreshCcw } from 'lucide-react'

type View = 'players' | 'teams' | 'draft' | 'dashboard'

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [draftState, setDraftState] = useState<DraftState>({
    isStarted: false,
    currentTurnIndex: 0,
    turnOrder: [],
    isSnakeReversed: false,
    history: []
  })

  // Carga inicial desde MongoDB
  const loadData = async () => {
    setLoading(true)
    try {
      const [p, t, d] = await Promise.all([api.getPlayers(), api.getTeams(), api.getDraftState()])
      setPlayers(p || [])
      setTeams(t || [])
      if (d) setDraftState(d)

      const savedSession = localStorage.getItem('soccer_session')
      if (savedSession) setSession(JSON.parse(savedSession))
    } catch (error) {
      console.error('Error conectando con el backend:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLogin = (user: Player | 'ADMIN') => {
    const newSession =
      user === 'ADMIN'
        ? { userId: 'admin-id', role: 'ADMIN' as const, name: 'Administrador' }
        : { userId: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` }

    setSession(newSession)
    localStorage.setItem('soccer_session', JSON.stringify(newSession))

    // Los jugadores van directo al draft board, solo el admin al dashboard
    setView(user === 'ADMIN' ? 'dashboard' : 'draft')

    // Cargar datos después del login exitoso (especialmente para admin)
    if (user === 'ADMIN') {
      loadData()
    }
  }

  const handleLogout = () => {
    setSession(null)
    localStorage.removeItem('soccer_session')
    localStorage.removeItem('auth_token')
    setView('dashboard')
  }

  const handleViewChange = async (newView: View) => {
    setView(newView)

    // Recargar datos cuando se accede a ciertas secciones
    if (newView === 'players' && session?.role === 'ADMIN') {
      try {
        const players = await api.getPlayers()
        setPlayers(players || [])
      } catch (error) {
        console.error('Error cargando jugadores:', error)
      }
    } else if (newView === 'teams' && session?.role === 'ADMIN') {
      try {
        const [players, teams] = await Promise.all([api.getPlayers(), api.getTeams()])
        setPlayers(players || [])
        setTeams(teams || [])
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
  }

  const addPlayer = async (player: Player) => {
    const created = await api.createPlayer(player)
    setPlayers((prev) => [...prev, created])
  }

  const handleStartDraft = async (order: string[]) => {
    const newState = {
      ...draftState,
      isStarted: true,
      turnOrder: order
    }
    await api.saveDraftState(newState)
    setDraftState(newState)
    setView('draft')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <RefreshCcw className="animate-spin mb-4" size={48} />
        <p className="font-bold tracking-widest uppercase">Sincronizando con Base de Datos...</p>
      </div>
    )
  }

  if (!session) {
    return <Login onLogin={handleLogin} players={players} onRegister={addPlayer} />
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Se mantiene igual con pequeñas mejoras */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Draft Soccer DB</h1>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              {session.role === 'ADMIN' ? <ShieldCheck size={18} /> : <User size={18} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-400 truncate">{session.name}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">{session.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {session.role === 'ADMIN' && (
            <button
              onClick={() => handleViewChange('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
          )}

          {session.role === 'ADMIN' && (
            <>
              <button
                onClick={() => handleViewChange('players')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'players' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <UserPlus size={20} /> Jugadores
              </button>
              <button
                onClick={() => handleViewChange('teams')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'teams' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Users size={20} /> Equipos
              </button>
            </>
          )}

          <button
            onClick={() => handleViewChange('draft')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'draft' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Trophy size={20} /> Draft Board
          </button>
        </div>
      </nav>

      <main className="flex-1 bg-slate-50 overflow-auto p-4 md:p-8">
        {view === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header>
              <h2 className="text-4xl font-black text-slate-800">Bienvenido, {session.name.split(' ')[0]}</h2>
              <p className="text-slate-500">Persistencia activa en MongoDB.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Base de Datos</p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">Conectada</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">Sincronización en tiempo real</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Jugadores</p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{players.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Equipos</p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{teams.length}</h3>
              </div>
            </div>
          </div>
        )}

        {view === 'players' && session.role === 'ADMIN' && (
          <PlayerRegistration
            players={players}
            onAddPlayer={addPlayer}
            onDeletePlayer={async (id) => {
              // Aquí iría api.deletePlayer(id)
              setPlayers((p) => p.filter((x) => x.id !== id))
            }}
          />
        )}

        {view === 'teams' && session.role === 'ADMIN' && (
          <TeamSetup
            players={players}
            setPlayers={setPlayers}
            teams={teams}
            setTeams={async (newTeams) => {
              // Sincronizar con API
              const latestTeam = (newTeams as Team[])[(newTeams as Team[]).length - 1]
              if (latestTeam) await api.createTeam(latestTeam)
              setTeams(newTeams as Team[])
            }}
            onStartDraft={handleStartDraft}
            resetDraft={() => {}}
            isDraftStarted={draftState.isStarted}
          />
        )}

        {view === 'draft' && (
          <DraftBoard
            players={players}
            setPlayers={setPlayers}
            teams={teams}
            setTeams={setTeams}
            draftState={draftState}
            setDraftState={async (newState) => {
              // En un board real, llamaríamos a api.saveDraftState(newState)
              setDraftState(newState as any)
            }}
            currentUser={session}
          />
        )}
      </main>
    </div>
  )
}

export default App
