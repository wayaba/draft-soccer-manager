import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Users, Trophy, LayoutDashboard, LogOut, ShieldCheck, User, Star } from 'lucide-react'

type View = 'players' | 'teams' | 'draft' | 'dashboard' | 'users'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { session, logout } = useAuth()

  if (!session) return null

  const menuItems = [
    ...(session.role === 'ADMIN'
      ? [
          {
            id: 'dashboard' as const,
            icon: LayoutDashboard,
            label: 'Dashboard'
          }
        ]
      : []),
    ...(session.role === 'ADMIN'
      ? [
          {
            id: 'users' as const,
            icon: Star,
            label: 'Gestión Usuarios'
          },
          {
            id: 'teams' as const,
            icon: Users,
            label: 'Equipos'
          }
        ]
      : []),
    {
      id: 'draft' as const,
      icon: Trophy,
      label: 'Draft Board'
    }
  ]

  return (
    <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Draft Soccer DB</h1>
      </div>

      {/* User Info */}
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
          onClick={logout}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
        >
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-emerald-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} /> {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
