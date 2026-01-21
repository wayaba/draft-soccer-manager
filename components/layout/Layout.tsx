import React, { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

type View = 'players' | 'teams' | 'draft' | 'dashboard' | 'users'

interface LayoutProps {
  children: ReactNode
  currentView: View
  onViewChange: (view: View) => void
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      <main className="flex-1 bg-slate-50 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  )
}
