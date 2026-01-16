
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

  const availableAsDelegate = players.filter(p => !p.teamId);

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
      delegateId: player.id,
      delegateName: delegateFullName,
      players: [player]
    };

    // Cambiar rol a DELEGADO y asignar equipo
    setPlayers(prev => prev.map(p => p.id === selectedDelegateId ? { ...p, teamId, role: 'DELEGADO' } : p));
    setTeams([...teams, team]);
    
    setNewTeamName('');
    setSelectedDelegateId('');
  };

  const removeTeam = (teamId: string) => {
    // Restaurar rol a JUGADOR al borrar equipo
    setPlayers(prev => prev.map(p => p.teamId === teamId ? { ...p, teamId: undefined, role: 'JUGADOR' } : p));
    setTeams(teams.filter(t => t.id !== teamId));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Equipos y Delegados</h2>
          <p className="text-slate-500">Gestión de capitanes para el Draft.</p>
        </div>
        <div className="flex gap-2">
            <button 
              disabled={teams.length < 2}
              onClick={() => onStartDraft(teams.map(t => t.id))}
              className="bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <Play size={20} /> Iniciar Draft
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings2 size={18} /> Nuevo Equipo</h3>
            <div className="space-y-4">
              <input 
                className="w-full p-3 bg-slate-50 rounded-xl border outline-none" placeholder="Nombre de Equipo"
                value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              />
              <select 
                className="w-full p-3 bg-slate-50 rounded-xl border outline-none text-sm"
                value={selectedDelegateId} onChange={e => setSelectedDelegateId(e.target.value)}
              >
                <option value="">-- Seleccionar Delegado --</option>
                {availableAsDelegate.map(p => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
              </select>
              <button onClick={addTeam} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Crear Equipo</button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {teams.map((team, idx) => (
            <div key={team.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">{idx + 1}</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{team.name}</h4>
                  <p className="text-sm text-emerald-600 font-semibold">Delegado: {team.delegateName}</p>
                </div>
              </div>
              {!isDraftStarted && <button onClick={() => removeTeam(team.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={20} /></button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;
