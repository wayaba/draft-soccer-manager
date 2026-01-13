
import React, { useState } from 'react';
import { Player, PlayerReference, PositionNames } from '../types';
import { Plus, Search, Trash2, UserCircle, Database } from 'lucide-react';

interface Props {
  players: Player[];
  onAddPlayer: (p: Player) => void;
  onDeletePlayer: (id: string) => void;
}

const REFERENCES: PlayerReference[] = [
  "Padre de Alumno",
  "Ex Alumno Egresado >34",
  "Padre de Alumno Egresado",
  "Docente",
  "Invitado",
  "Padre de Alumno No Egresado",
  "Otro"
];

const FIRST_NAMES = ["Juan", "Bautista", "Mateo", "Santiago", "Ignacio", "Lucas", "Nicolas", "Julian", "Tomas", "Felipe", "Marcos", "Agustin", "Valentin", "Benjamin", "Joaquin"];
const LAST_NAMES = ["González", "Rodriguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez", "García", "Sánchez", "Romero", "Álvarez", "Torres", "Ruiz", "Ramírez"];

const PlayerRegistration: React.FC<Props> = ({ players, onAddPlayer, onDeletePlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Player>>({
    primaryPos: 1,
    secondaryPos: 8,
    reference: "Otro"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      dni: formData.dni || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      birthDate: formData.birthDate || '',
      phone: formData.phone || '',
      email: formData.email || '',
      primaryPos: Number(formData.primaryPos),
      secondaryPos: Number(formData.secondaryPos),
      reference: formData.reference as PlayerReference || 'Otro'
    };
    onAddPlayer(newPlayer);
    setFormData({ primaryPos: 1, secondaryPos: 8, reference: "Otro" });
    setShowForm(false);
  };

  const simulatePlayers = () => {
    for (let i = 0; i < 20; i++) {
      const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const pPos = Math.floor(Math.random() * 11) + 1;
      let sPos = Math.floor(Math.random() * 11) + 1;
      while (sPos === pPos) sPos = Math.floor(Math.random() * 11) + 1;

      const newPlayer: Player = {
        id: crypto.randomUUID(),
        dni: Math.floor(10000000 + Math.random() * 40000000).toString(),
        firstName: fName,
        lastName: lName,
        birthDate: `19${Math.floor(70 + Math.random() * 30)}-0${Math.floor(1+Math.random()*8)}-${Math.floor(10+Math.random()*18)}`,
        phone: `11${Math.floor(10000000 + Math.random() * 80000000)}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
        primaryPos: pPos,
        secondaryPos: sPos,
        reference: REFERENCES[Math.floor(Math.random() * REFERENCES.length)]
      };
      onAddPlayer(newPlayer);
    }
  };

  const filteredPlayers = players.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Registro de Jugadores</h2>
          <p className="text-slate-500">Base de datos central del torneo.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={simulatePlayers}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Database size={18} /> Simular 20 Jugadores
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            {showForm ? 'Cerrar Formulario' : <><Plus size={20} /> Registrar Jugador</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre</label>
              <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Apellido</label>
              <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">DNI</label>
              <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.dni || ''} onChange={e => setFormData({...formData, dni: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Fecha Nacimiento</label>
              <input required type="date" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Celular</label>
              <input required type="tel" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input required type="email" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Posición Primaria</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.primaryPos} onChange={e => setFormData({...formData, primaryPos: Number(e.target.value)})}>
                {Object.entries(PositionNames).map(([val, name]) => (
                  <option key={val} value={val}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Posición Secundaria</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.secondaryPos} onChange={e => setFormData({...formData, secondaryPos: Number(e.target.value)})}>
                {Object.entries(PositionNames).map(([val, name]) => (
                  <option key={val} value={val}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Referencia</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value as PlayerReference})}>
                {REFERENCES.map(ref => (
                  <option key={ref} value={ref}>{ref}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
                Confirmar Alta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
              type="text" 
              placeholder="Buscar por nombre o DNI..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="text-sm text-slate-500 font-medium">
             Mostrando {filteredPlayers.length} de {players.length} jugadores
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Jugador</th>
                <th className="px-6 py-4">DNI / Edad</th>
                <th className="px-6 py-4">Posiciones</th>
                <th className="px-6 py-4">Referencia</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlayers.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{p.lastName}, {p.firstName}</p>
                        <p className="text-xs text-slate-400">{p.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="font-mono">{p.dni}</p>
                    <p className="text-xs text-slate-400">{p.birthDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold w-fit uppercase">P: {PositionNames[p.primaryPos]}</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold w-fit uppercase">S: {PositionNames[p.secondaryPos]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{p.reference}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDeletePlayer(p.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerRegistration;
