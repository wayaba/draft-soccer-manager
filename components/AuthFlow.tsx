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
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">¡Registro Exitoso!</h3>
            <p className="text-center text-slate-600 mb-4">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AuthFlow
