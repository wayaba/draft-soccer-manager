import React, { useState } from 'react'
import { Player } from '../types'
import { Trophy, LogIn } from 'lucide-react'
import { api } from '../services/api'

interface Props {
  onLogin: (user: Player | 'ADMIN') => void
  onRegister: () => void
}

const Login: React.FC<Props> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [players, setPlayers] = useState<Player[]>([])

  // Cargar players solo cuando sea necesario para el login
  const loadPlayersForLogin = async () => {
    if (players.length === 0) {
      try {
        const playersData = await api.getPlayers()
        setPlayers(playersData || [])
      } catch (error) {
        console.log('No se pudieron cargar los jugadores para login, continuando sin ellos')
      }
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('') // Limpiar error anterior

    try {
      const { api } = await import('../services/api')
      const loginResponse = await api.login(email, password)

      // Guardar el token en localStorage
      localStorage.setItem('auth_token', loginResponse.access_token)

      // Determinar si es admin o jugador basado en el tipo
      if (loginResponse.user.tipo === 'admin') {
        onLogin('ADMIN')
      } else {
        // Cargar players para buscar el jugador
        await loadPlayersForLogin()

        // Buscar el jugador en la lista local o crear uno temporal
        const player = players.find((p) => p.email === email)
        if (player) {
          onLogin(player)
        } else {
          // Si no existe, crear un jugador temporal con los datos del login
          const tempPlayer: Player = {
            id: loginResponse.user.id,
            dni: '',
            firstName: loginResponse.user.nombre,
            lastName: loginResponse.user.apellido,
            birthDate: '',
            phone: '',
            email: loginResponse.user.email,
            primaryPos: 8,
            secondaryPos: 1,
            reference: 'Otro',
            role: 'JUGADOR'
          }
          onLogin(tempPlayer)
        }
      }
    } catch (error) {
      setLoginError('Error en el login. Verifica tus credenciales.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Email</label>
              <input
                type="email"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (loginError) setLoginError('') // Limpiar error al escribir
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Contraseña</label>
              <input
                type="password"
                className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 font-bold ${
                  loginError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (loginError) setLoginError('') // Limpiar error al escribir
                }}
                required
              />
              {loginError && <p className="text-red-500 text-sm font-medium px-1">{loginError}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={20} /> Ingresar
                </>
              )}
            </button>
            <div className="text-center">
              <button type="button" onClick={onRegister} className="text-sm font-bold text-emerald-600 hover:underline">
                ¿No tienes cuenta? Regístrate acá
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
