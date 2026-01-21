import React, { useState } from 'react'
import { Player } from '../types'
import Login from './Login'
import Register from './Register'

interface Props {
  onLogin: (user: Player | 'ADMIN') => void
}

const AuthFlow: React.FC<Props> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegisterSuccess = (message: string) => {
    setSuccessMessage(message)
    setCurrentView('login')

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const handleBackToLogin = () => {
    setCurrentView('login')
    setSuccessMessage('')
  }

  const handleGoToRegister = () => {
    setCurrentView('register')
    setSuccessMessage('')
  }

  if (currentView === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} onBackToLogin={handleBackToLogin} />
  }

  return (
    <>
      <Login onLogin={onLogin} onRegister={handleGoToRegister} />
      {successMessage && <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">{successMessage}</div>}
    </>
  )
}

export default AuthFlow
