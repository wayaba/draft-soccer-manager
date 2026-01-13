
import React, { useState, useEffect, useCallback } from 'react';
import { Player, Team, DraftState, PositionNames } from './types';
import PlayerRegistration from './components/PlayerRegistration';
import TeamSetup from './components/TeamSetup';
import DraftBoard from './components/DraftBoard';
import { UserPlus, Users, Trophy, LayoutDashboard } from 'lucide-react';

type View = 'players' | 'teams' | 'draft' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draftState, setDraftState] = useState<DraftState>({
    isStarted: false,
    currentTurnIndex: 0,
    turnOrder: [],
    isSnakeReversed: false,
    history: []
  });

  // Load from local storage
  useEffect(() => {
    const savedPlayers = localStorage.getItem('soccer_players');
    const savedTeams = localStorage.getItem('soccer_teams');
    const savedDraft = localStorage.getItem('soccer_draft_state');
    
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedDraft) setDraftState(JSON.parse(savedDraft));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('soccer_players', JSON.stringify(players));
    localStorage.setItem('soccer_teams', JSON.stringify(teams));
    localStorage.setItem('soccer_draft_state', JSON.stringify(draftState));
  }, [players, teams, draftState]);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const deletePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player?.teamId) {
        alert("No se puede eliminar un jugador que ya pertenece a un equipo o es delegado.");
        return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleStartDraft = (order: string[]) => {
    setDraftState({
      isStarted: true,
      currentTurnIndex: 0,
      turnOrder: order,
      isSnakeReversed: false,
      history: []
    });
    setView('draft');
  };

  const resetDraft = () => {
      if (!confirm("¿Estás seguro de resetear el draft? Se perderán todas las asignaciones actuales.")) return;
      
      setDraftState({
        isStarted: false,
        currentTurnIndex: 0,
        turnOrder: [],
        isSnakeReversed: false,
        history: []
      });
      setPlayers(prev => prev.map(p => ({ ...p, teamId: undefined })));
      setTeams(prev => prev.map(t => ({ ...t, players: [] })));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Draft Soccer</h1>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('players')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'players' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <UserPlus size={20} /> Jugadores ({players.length})
          </button>
          <button 
            onClick={() => setView('teams')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'teams' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} /> Equipos ({teams.length})
          </button>
          <button 
            onClick={() => setView('draft')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'draft' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Trophy size={20} /> Draft Board {draftState.isStarted && <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>}
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <p className="text-xs text-slate-500 text-center font-medium">Pro Draft Engine v1.2</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-auto p-4 md:p-8">
        {view === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
              <p className="text-slate-500 text-lg">Gestiona el flujo del torneo de fútbol.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Jugadores</p>
                <h3 className="text-5xl font-black text-emerald-600 mt-2">{players.length}</h3>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{width: `${Math.min((players.length / (teams.length > 0 ? teams.length * 11 : 1)) * 100, 100)}%`}}></div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Equipos</p>
                <h3 className="text-5xl font-black text-blue-600 mt-2">{teams.length}</h3>
                <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-tight">Confirmados para el draft</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Estado Draft</p>
                <div className="mt-2 flex items-center gap-3">
                    <h3 className={`text-2xl font-black mt-2 ${draftState.isStarted ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {draftState.isStarted ? 'ACTIVO' : 'PENDIENTE'}
                    </h3>
                    {draftState.isStarted && <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>}
                </div>
                <p className="text-xs text-slate-400 mt-6 font-medium">Total de picks: {draftState.history.length}</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-black mb-4">Mesa de Draft Sincronizada</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">Cada delegado tiene su turno exclusivo. El sistema Snake asegura paridad competitiva invirtiendo el orden automáticamente.</p>
                <button 
                  onClick={() => setView(draftState.isStarted ? 'draft' : 'teams')}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  {draftState.isStarted ? 'Ir al Board en Vivo' : 'Configurar Equipos'}
                </button>
              </div>
              <Trophy className="absolute -right-16 -bottom-16 w-80 h-80 text-white/5 rotate-12" />
            </div>
          </div>
        )}

        {view === 'players' && (
          <PlayerRegistration 
            players={players} 
            onAddPlayer={addPlayer} 
            onDeletePlayer={deletePlayer} 
          />
        )}

        {view === 'teams' && (
          <TeamSetup 
            players={players}
            setPlayers={setPlayers}
            teams={teams} 
            setTeams={setTeams} 
            onStartDraft={handleStartDraft} 
            resetDraft={resetDraft}
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
            setDraftState={setDraftState}
          />
        )}
      </main>
    </div>
  );
};

export default App;
