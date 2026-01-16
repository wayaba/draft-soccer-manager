
import React, { useState, useMemo } from 'react';
import { Player, Team, DraftState, PositionNames, AuthSession } from '../types';
import { Shield, ChevronRight, Search, ArrowRightLeft, Plus, Clock } from 'lucide-react';

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  currentUser: AuthSession;
}

const DraftBoard: React.FC<Props> = ({ players, setPlayers, teams, setTeams, draftState, setDraftState, currentUser }) => {
  const [filterPos, setFilterPos] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const currentTeamId = draftState.turnOrder[draftState.currentTurnIndex];
  const currentTeam = teams.find(t => t.id === currentTeamId);
  
  // VALIDACIÓN REAL: Es mi turno si soy delegado y mi ID coincide con el ID de delegado del equipo actual
  const isMyTurn = currentUser.role === 'DELEGADO' && currentUser.userId === currentTeam?.delegateId;

  const availablePlayers = useMemo(() => players.filter(p => !p.teamId), [players]);

  const filteredAvailable = availablePlayers.filter(p => {
    const matchesPos = filterPos === 'all' || p.primaryPos === filterPos || p.secondaryPos === filterPos;
    const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPos && matchesSearch;
  });

  const selectPlayer = (player: Player) => {
    if (!draftState.isStarted || !currentTeamId || !isMyTurn) return;

    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, teamId: currentTeamId } : p));
    setTeams(prev => prev.map(t => t.id === currentTeamId ? { ...t, players: [...t.players, player] } : t));

    let nextIndex = draftState.currentTurnIndex;
    let nextIsReversed = draftState.isSnakeReversed;

    if (!nextIsReversed) {
      if (nextIndex === draftState.turnOrder.length - 1) nextIsReversed = true;
      else nextIndex++;
    } else {
      if (nextIndex === 0) nextIsReversed = false;
      else nextIndex--;
    }

    setDraftState(prev => ({
      ...prev,
      currentTurnIndex: nextIndex,
      isSnakeReversed: nextIsReversed,
      history: [...prev.history, player.id]
    }));
  };

  if (!draftState.isStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <Shield size={64} className="text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">Draft no iniciado</h2>
        <p className="text-slate-500">Espera a que el Administrador comience la ceremonia.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Turn Banner */}
      <div className={`p-8 rounded-3xl shadow-2xl relative transition-all duration-500 ${isMyTurn ? 'bg-emerald-600 ring-8 ring-emerald-500/20' : 'bg-slate-900'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-center md:text-left">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isMyTurn ? 'bg-white text-emerald-600 animate-pulse' : 'bg-emerald-500 text-white'}`}>
                {isMyTurn ? '¡ES TU TURNO!' : 'TURNO ACTUAL'}
            </span>
            <h2 className="text-5xl font-black text-white mt-2">{currentTeam?.name}</h2>
            <p className="text-emerald-100/70 font-medium">Delegado: {currentTeam?.delegateName}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 text-white">
             <div className="text-right">
                <p className="text-[10px] opacity-60 uppercase font-bold">Ronda Snake</p>
                <div className="flex items-center gap-2">
                    {draftState.isSnakeReversed ? <ArrowRightLeft size={16} /> : <ChevronRight size={16} />}
                    <span className="font-mono font-bold">{draftState.isSnakeReversed ? 'INVERSA' : 'NORMAL'}</span>
                </div>
             </div>
             <div className="h-10 w-px bg-white/20"></div>
             <div className="text-center">
                <p className="text-[10px] opacity-60 uppercase font-bold">Total Picks</p>
                <span className="text-3xl font-black">{draftState.history.length}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="p-6 bg-slate-50/50 border-b flex flex-col md:flex-row gap-4">
                <input 
                  type="text" placeholder="Buscar jugador..." 
                  className="flex-1 p-3 bg-white rounded-xl border outline-none text-sm"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                  className="p-3 bg-white rounded-xl border outline-none text-sm font-medium"
                  value={filterPos} onChange={e => setFilterPos(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value="all">Todas las posiciones</option>
                  {Object.entries(PositionNames).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
                </select>
            </div>

            <div className="max-h-[500px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
              {filteredAvailable.map(p => (
                <div key={p.id} className="bg-white p-5 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-800">{p.lastName}, {p.firstName}</h4>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase">{PositionNames[p.primaryPos]}</span>
                  </div>
                  {isMyTurn && (
                    <button onClick={() => selectPlayer(p)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1 hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                      <Plus size={16} /> Elegir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <h3 className="text-sm font-black text-slate-800 mb-4 uppercase flex items-center gap-2"><Clock size={16}/> Siguientes</h3>
            <div className="space-y-3">
              {/* Lógica de próximos turnos simplificada para UI */}
              <p className="text-xs text-slate-500 italic">Sigue el orden de Snake Draft...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftBoard;
