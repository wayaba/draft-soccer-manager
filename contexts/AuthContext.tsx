import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthSession, Player } from '../types'

interface AuthContextType {
  session: AuthSession | null
  login: (user: Player | 'ADMIN') => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSession = () => {
      const savedSession = localStorage.getItem('soccer_session')
      if (savedSession) {
        try {
          setSession(JSON.parse(savedSession))
        } catch (error) {
          console.error('Error loading session:', error)
          localStorage.removeItem('soccer_session')
        }
      }
      setIsLoading(false)
    }

    loadSession()
  }, [])

  const login = (user: Player | 'ADMIN') => {
    const newSession =
      user === 'ADMIN'
        ? { userId: 'admin-id', role: 'ADMIN' as const, name: 'Administrador' }
        : { userId: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` }

    setSession(newSession)
    localStorage.setItem('soccer_session', JSON.stringify(newSession))
  }

  const logout = () => {
    setSession(null)
    localStorage.removeItem('soccer_session')
    localStorage.removeItem('auth_token')
  }

  const value: AuthContextType = {
    session,
    login,
    logout,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
