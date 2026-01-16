
import React, { useState } from 'react';
import { Player, PlayerReference, PositionNames, UserRole } from '../types';
import { Trophy, UserPlus, LogIn, ShieldCheck, Database } from 'lucide-react';

interface Props {
  onLogin: (user: Player | 'ADMIN') => void;
  onRegister: (player: Player) => void;
  players: Player[];
}

const Login: React.FC<Props> = ({ onLogin, onRegister, players }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [dni, setDni] = useState('');
  
  // Registration State
  const [regData, setRegData] = useState<Partial<Player>>({
    primaryPos: 1,
    secondaryPos: 8,
    reference: "Otro"
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.toLowerCase() === 'admin') {
      onLogin('ADMIN');
      return;
    }
    const player = players.find(p => p.dni === dni);
    if (player) {
      onLogin(player);
    } else {
      alert("DNI no encontrado. Por favor regístrate.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      dni: regData.dni || '',
      firstName: regData.firstName || '',
      lastName: regData.lastName || '',
      birthDate: regData.birthDate || '',
      phone: regData.phone || '',
      email: regData.email || '',
      primaryPos: Number(regData.primaryPos),
      secondaryPos: Number(regData.secondaryPos),
      reference: regData.reference as PlayerReference || 'Otro',
      role: 'JUGADOR'
    };
    onRegister(newPlayer);
    alert("¡Registro exitoso! Ahora puedes ingresar con tu DNI.");
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 bg-emerald-600 text-white text-center">
          <div className="inline-block p-4 bg-white/20 rounded-2xl mb-4">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Draft Soccer</h2>
          <p className="text-emerald-100 font-medium">Torneo de Ex Alumnos</p>
        </div>

        <div className="p-8">
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Ingresa tu DNI</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  placeholder="Escribe 'admin' o tu DNI"
                  value={dni}
                  onChange={e => setDni(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <LogIn size={20} /> Ingresar
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setIsRegistering(true)} className="text-sm font-bold text-emerald-600 hover:underline">
                  ¿No tienes cuenta? Regístrate aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <h3 className="font-black text-slate-800 text-xl mb-4">Registro de Jugador</h3>
              <div className="grid grid-cols-1 gap-4">
                <input required placeholder="Nombre" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, firstName: e.target.value})} />
                <input required placeholder="Apellido" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, lastName: e.target.value})} />
                <input required placeholder="DNI" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, dni: e.target.value})} />
                <input required type="date" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, birthDate: e.target.value})} />
                <select className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, primaryPos: Number(e.target.value)})}>
                  {Object.entries(PositionNames).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
                </select>
                <input required type="tel" placeholder="Celular" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setRegData({...regData, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 mt-4 transition-all">
                Registrarme
              </button>
              <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-sm font-bold text-slate-400">
                Volver al Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
