
import React, { useState } from 'react';
import { Team, Player } from '../types';
import { Plus, Trash2, Shield, Play, Settings2, RefreshCw, UserCheck } from 'lucide-react';

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  onStartDraft: (order: string[]) => void;
  resetDraft: () => void;
  isDraftStarted: boolean;
}

const TeamSetup: React.FC<Props> = ({ players, setPlayers, teams, setTeams, onStartDraft, resetDraft, isDraftStarted }) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedDelegateId, setSelectedDelegateId] = useState('');

  // Filtrar jugadores que NO sean delegados de otros equipos
  const availableAsDelegate = players.filter(p => 
    !teams.some(t => t.delegateName === `${p.firstName} ${p.lastName}`) && !p.teamId
  );

  const addTeam = () => {
    if (!newTeamName || !selectedDelegateId) {
      alert("Por favor completa el nombre del equipo y selecciona un delegado.");
      return;
    }

    const player = players.find(p => p.id === selectedDelegateId);
    if (!player) return;

    const delegateFullName = `${player.firstName} ${player.lastName}`;
    const teamId = crypto.randomUUID();

    const team: Team = {
      id: teamId,
      name: newTeamName,
      delegateName: delegateFullName,
      players: [player] // El delegado ya es parte de su equipo
    };

    // Marcar al jugador como asignado al equipo
    setPlayers(prev => prev.map(p => p.id === selectedDelegateId ? { ...p, teamId } : p));
    setTeams([...teams, team]);
    
    setNewTeamName('');
    setSelectedDelegateId('');
  };

  const removeTeam = (teamId: string) => {
    // Al remover el equipo, liberamos a los jugadores (incluyendo al delegado)
    setPlayers(prev => prev.map(p => p.teamId === teamId ? { ...p, teamId: undefined } : p));
    setTeams(teams.filter(t => t.id !== teamId));
  };

  const handleStart = () => {
    if (teams.length < 2) {
      alert("Se necesitan al menos 2 equipos para el draft.");
      return;
    }
    onStartDraft(teams.map(t => t.id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Equipos y Delegados</h2>
          <p className="text-slate-500">Cada equipo debe tener un delegado (que es un jugador registrado).</p>
        </div>
        <div className="flex gap-2">
            {isDraftStarted && (
                <button 
                onClick={resetDraft}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-red-200 transition-all"
                >
                <RefreshCw size={18} /> Resetear Draft
                </button>
            )}
            <button 
            disabled={teams.length < 2}
            onClick={handleStart}
            className="bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
            >
            <Play size={20} /> {isDraftStarted ? 'Continuar Draft' : 'Iniciar Draft'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings2 size={18} className="text-emerald-500" /> Nuevo Equipo
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Equipo</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ej: Los Galácticos"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seleccionar Delegado</label>
                <select 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={selectedDelegateId}
                  onChange={e => setSelectedDelegateId(e.target.value)}
                >
                  <option value="">-- Seleccionar Jugador --</option>
                  {availableAsDelegate.map(p => (
                    <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} (DNI: {p.dni})</option>
                  ))}
                </select>
                {availableAsDelegate.length === 0 && players.length > 0 && (
                    <p className="text-[10px] text-orange-600 font-medium italic">No hay más jugadores disponibles para ser delegados.</p>
                )}
                {players.length === 0 && (
                    <p className="text-[10px] text-red-500 font-medium">Primero debes registrar jugadores.</p>
                )}
              </div>
              <button 
                disabled={!newTeamName || !selectedDelegateId}
                onClick={addTeam}
                className="w-full bg-slate-900 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Plus size={20} /> Crear Equipo
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {teams.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
               <Shield size={48} className="mb-4 opacity-20" />
               <p>Registra equipos para comenzar el draft.</p>
            </div>
          ) : (
            teams.map((team, idx) => (
              <div key={team.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{team.name}</h4>
                    <div className="flex items-center gap-2 text-emerald-600">
                        <UserCheck size={14} />
                        <p className="text-sm font-semibold italic">Delegado: {team.delegateName}</p>
                    </div>
                  </div>
                </div>
                {!isDraftStarted && (
                    <button 
                    onClick={() => removeTeam(team.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                    <Trash2 size={20} />
                    </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;
