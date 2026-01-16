
import React, { useState, useEffect } from 'react';
import { Player, Team, DraftState, AuthSession, UserRole } from './types';
import PlayerRegistration from './components/PlayerRegistration';
import TeamSetup from './components/TeamSetup';
import DraftBoard from './components/DraftBoard';
import Login from './components/Login';
import { UserPlus, Users, Trophy, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';

type View = 'players' | 'teams' | 'draft' | 'dashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
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

  useEffect(() => {
    const savedPlayers = localStorage.getItem('soccer_players');
    const savedTeams = localStorage.getItem('soccer_teams');
    const savedDraft = localStorage.getItem('soccer_draft_state');
    const savedSession = localStorage.getItem('soccer_session');
    
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedDraft) setDraftState(JSON.parse(savedDraft));
    if (savedSession) setSession(JSON.parse(savedSession));
  }, []);

  useEffect(() => {
    localStorage.setItem('soccer_players', JSON.stringify(players));
    localStorage.setItem('soccer_teams', JSON.stringify(teams));
    localStorage.setItem('soccer_draft_state', JSON.stringify(draftState));
    if (session) localStorage.setItem('soccer_session', JSON.stringify(session));
    else localStorage.removeItem('soccer_session');
  }, [players, teams, draftState, session]);

  const handleLogin = (user: Player | 'ADMIN') => {
    if (user === 'ADMIN') {
      setSession({ userId: 'admin-id', role: 'ADMIN', name: 'Administrador' });
    } else {
      setSession({ userId: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` });
    }
    setView('dashboard');
  };

  const handleLogout = () => {
    setSession(null);
    setView('dashboard');
  };

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
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

  if (!session) {
    return <Login onLogin={handleLogin} players={players} onRegister={addPlayer} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Draft Soccer</h1>
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
          <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          {session.role === 'ADMIN' && (
            <>
              <button onClick={() => setView('players')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'players' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <UserPlus size={20} /> Jugadores
              </button>
              <button onClick={() => setView('teams')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'teams' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Users size={20} /> Equipos
              </button>
            </>
          )}
          
          <button onClick={() => setView('draft')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'draft' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Trophy size={20} /> Draft Board {draftState.isStarted && <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-auto p-4 md:p-8">
        {view === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header>
              <h2 className="text-4xl font-black text-slate-800">Bienvenido, {session.name.split(' ')[0]}</h2>
              <p className="text-slate-500">Estado actual del torneo y accesos rápidos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tu Perfil</p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{session.role}</h3>
                <p className="text-xs text-slate-500 mt-1">Acceso a {session.role === 'ADMIN' ? 'gestión total' : session.role === 'DELEGADO' ? 'toma de decisiones' : 'visualización'}.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Participantes</p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{players.length} Jugadores</h3>
                <p className="text-xs text-slate-500 mt-1">{teams.length} Equipos creados.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Estado Draft</p>
                <h3 className={`text-xl font-bold mt-2 ${draftState.isStarted ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {draftState.isStarted ? 'EN CURSO' : 'NO INICIADO'}
                </h3>
              </div>
            </div>

            {session.role === 'JUGADOR' && !players.find(p => p.id === session.userId)?.teamId && (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold text-amber-800 mb-2">Estado de Inscripción</h3>
                <p className="text-amber-700">Aún no has sido asignado a ningún equipo. Espera a que el Admin cree los equipos o que comience el Draft.</p>
              </div>
            )}
          </div>
        )}

        {view === 'players' && session.role === 'ADMIN' && (
          <PlayerRegistration players={players} onAddPlayer={addPlayer} onDeletePlayer={(id) => setPlayers(p => p.filter(x => x.id !== id))} />
        )}

        {view === 'teams' && session.role === 'ADMIN' && (
          <TeamSetup players={players} setPlayers={setPlayers} teams={teams} setTeams={setTeams} onStartDraft={handleStartDraft} resetDraft={() => {}} isDraftStarted={draftState.isStarted} />
        )}

        {view === 'draft' && (
          <DraftBoard 
            players={players} setPlayers={setPlayers} teams={teams} setTeams={setTeams}
            draftState={draftState} setDraftState={setDraftState}
            currentUser={session}
          />
        )}
      </main>
    </div>
  );
};

export default App;
