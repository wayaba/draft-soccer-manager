
import React, { useState, useMemo, useEffect } from 'react';
import { Player, Team, DraftState, PositionNames } from '../types';
import { Shield, ChevronRight, Hash, Search, ArrowRightLeft, Plus, Clock, AlertCircle } from 'lucide-react';

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
}

const DraftBoard: React.FC<Props> = ({ players, setPlayers, teams, setTeams, draftState, setDraftState }) => {
  const [filterPos, setFilterPos] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // En una app real, esto vendría de un sistema de Auth. 
  // Para este prototipo, simularemos que el usuario selecciona quién es para poder probar los turnos.
  const [activeDelegateSession, setActiveDelegateSession] = useState<string | null>(null);

  const currentTeamId = draftState.turnOrder[draftState.currentTurnIndex];
  const currentTeam = teams.find(t => t.id === currentTeamId);
  const isMyTurn = activeDelegateSession === currentTeam?.delegateName;

  const availablePlayers = useMemo(() => 
    players.filter(p => !p.teamId), 
  [players]);

  const filteredAvailable = availablePlayers.filter(p => {
    const matchesPos = filterPos === 'all' || p.primaryPos === filterPos || p.secondaryPos === filterPos;
    const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPos && matchesSearch;
  });

  const selectPlayer = (player: Player) => {
    if (!draftState.isStarted || !currentTeamId || !isMyTurn) return;

    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, teamId: currentTeamId } : p));
    
    setTeams(prev => prev.map(t => {
        if (t.id === currentTeamId) {
            return { ...t, players: [...t.players, player] };
        }
        return t;
    }));

    let nextIndex = draftState.currentTurnIndex;
    let nextIsReversed = draftState.isSnakeReversed;

    if (!nextIsReversed) {
      if (nextIndex === draftState.turnOrder.length - 1) {
        nextIsReversed = true;
      } else {
        nextIndex++;
      }
    } else {
      if (nextIndex === 0) {
        nextIsReversed = false;
      } else {
        nextIndex--;
      }
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Draft no iniciado</h2>
        <p className="text-slate-500 mb-8 max-w-md">Ve a la pestaña de equipos, configura los delegados e inicia la ceremonia.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Selector de Sesión Simulado para Testing */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <p className="text-sm text-amber-800 font-medium">
                Simulador de sesión: Selecciona qué delegado eres para probar los turnos.
            </p>
        </div>
        <select 
            className="bg-white border border-amber-300 rounded-lg p-1.5 text-xs font-bold outline-none"
            value={activeDelegateSession || ''}
            onChange={(e) => setActiveDelegateSession(e.target.value)}
        >
            <option value="">-- Ver como espectador --</option>
            {teams.map(t => (
                <option key={t.id} value={t.delegateName}>{t.delegateName} ({t.name})</option>
            ))}
        </select>
      </div>

      {/* Main Turn Banner */}
      <div className={`p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 ${isMyTurn ? 'bg-emerald-600 ring-8 ring-emerald-500/20' : 'bg-slate-900'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isMyTurn ? 'bg-white text-emerald-600 animate-pulse' : 'bg-emerald-500 text-white'}`}>
                    {isMyTurn ? '¡ES TU TURNO!' : 'TURNO ACTUAL'}
                </span>
            </div>
            <h2 className="text-5xl font-black text-white">{currentTeam?.name}</h2>
            <p className="text-emerald-100/70 font-medium mt-1">Delegado: {currentTeam?.delegateName}</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
             <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase font-bold">Ronda Snake</p>
                <div className="flex items-center gap-2 text-white">
                    {draftState.isSnakeReversed ? <ArrowRightLeft size={16} className="text-orange-400" /> : <ChevronRight size={16} className="text-emerald-400" />}
                    <span className="font-mono font-bold tracking-tight">{draftState.isSnakeReversed ? 'INVERSA (B-A)' : 'NORMAL (A-B)'}</span>
                </div>
             </div>
             <div className="h-10 w-px bg-white/20"></div>
             <div className="text-center text-white">
                <p className="text-[10px] text-white/60 uppercase font-bold">Picks Realizados</p>
                <span className="text-3xl font-black">{draftState.history.length}</span>
             </div>
          </div>
        </div>
        {!isMyTurn && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm font-bold">
                    <Clock size={16} className="animate-spin" /> Esperando elección de {currentTeam?.delegateName}...
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Available Players */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
            {!isMyTurn && (
                <div className="absolute inset-0 z-20 bg-slate-50/10 backdrop-blur-[1px] pointer-events-none"></div>
            )}
            
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        disabled={!isMyTurn}
                        type="text" 
                        placeholder="Buscar jugador..." 
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    disabled={!isMyTurn}
                    className="p-3 bg-white rounded-xl border border-slate-200 text-sm outline-none font-medium disabled:opacity-50"
                    value={filterPos}
                    onChange={e => setFilterPos(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                    <option value="all">Todas las posiciones</option>
                    {Object.entries(PositionNames).map(([val, name]) => (
                        <option key={val} value={val}>{name}</option>
                    ))}
                </select>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                {filteredAvailable.map(p => (
                  <div key={p.id} className={`bg-white p-5 group flex items-center justify-between transition-all ${isMyTurn ? 'hover:bg-emerald-50 cursor-pointer' : 'opacity-80'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${isMyTurn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {p.primaryPos}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{p.lastName}, {p.firstName}</h4>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase">{PositionNames[p.primaryPos]}</span>
                        </div>
                      </div>
                    </div>
                    {isMyTurn && (
                        <button 
                            onClick={() => selectPlayer(p)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg transform active:scale-95"
                        >
                            <Plus size={18} /> Elegir
                        </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Preview & Next Turns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" /> Mi Plantel
              </h3>
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                {currentTeam?.players.length} / 11
              </span>
            </div>
            <div className="p-4 max-h-[350px] overflow-y-auto bg-slate-50/30">
              {currentTeam?.players.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm italic">
                    {isMyTurn ? '¡Tu equipo está vacío! Elige tu primer jugador.' : 'Esperando selecciones...'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {currentTeam?.players.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-slate-300 w-4">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{p.lastName}, {p.firstName}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">{PositionNames[p.primaryPos]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Próximas Elecciones
            </h3>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => {
                let turnIdx = draftState.currentTurnIndex;
                let isReversed = draftState.isSnakeReversed;
                let lookAheadIdx = turnIdx;
                let lookAheadReversed = isReversed;
                const nextTurns = [];
                
                for (let j = 0; j <= 5; j++) {
                    if (j > 0) { // Saltamos el turno actual
                        if (!lookAheadReversed) {
                            if (lookAheadIdx === draftState.turnOrder.length - 1) { lookAheadReversed = true; } 
                            else { lookAheadIdx++; }
                        } else {
                            if (lookAheadIdx === 0) { lookAheadReversed = false; } 
                            else { lookAheadIdx--; }
                        }
                        nextTurns.push(teams.find(t => t.id === draftState.turnOrder[lookAheadIdx]));
                    }
                }

                const teamAtTurn = nextTurns[i];
                if (!teamAtTurn) return null;

                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${teamAtTurn.delegateName === activeDelegateSession ? 'bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10' : 'bg-slate-50/50 border-transparent'}`}>
                    <div className={`w-2 h-2 rounded-full ${teamAtTurn.delegateName === activeDelegateSession ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <div className="flex-1">
                        <p className={`text-xs font-bold ${teamAtTurn.delegateName === activeDelegateSession ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {teamAtTurn.name}
                        </p>
                        <p className="text-[10px] text-slate-400 italic">{teamAtTurn.delegateName}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">+{i+1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Draft History / Ticker */}
      <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">Últimas Selecciones</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[...draftState.history].reverse().slice(0, 10).map((playerId, idx) => {
                const p = players.find(player => player.id === playerId);
                const t = teams.find(team => team.id === p?.teamId);
                return (
                    <div key={idx} className="flex-shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[180px]">
                        <p className="text-[10px] font-bold text-emerald-600 mb-1">{t?.name}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{p?.lastName}, {p?.firstName}</p>
                        <p className="text-[9px] text-slate-400 uppercase">{p ? PositionNames[p.primaryPos] : ''}</p>
                    </div>
                );
            })}
            {draftState.history.length === 0 && <p className="text-sm text-slate-400 italic">El historial aparecerá aquí...</p>}
        </div>
      </div>
    </div>
  );
};

export default DraftBoard;
