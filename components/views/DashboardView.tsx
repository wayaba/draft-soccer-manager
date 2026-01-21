import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

export const DashboardView: React.FC = () => {
  const { session } = useAuth()
  const { players, teams } = useData()

  if (!session || session.role !== 'ADMIN') {
    return null
  }

  return (
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
  )
}
