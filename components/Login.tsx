import React, { useState, useRef } from 'react'
import { Player, PlayerReference, PositionNames, UserRole, getAvailableSecondaryPositions } from '../types'
import { Trophy, UserPlus, LogIn, ShieldCheck, Database } from 'lucide-react'

interface Props {
  onLogin: (user: Player | 'ADMIN') => void
  onRegister: (player: Player) => void
  players: Player[]
}

const Login: React.FC<Props> = ({ onLogin, onRegister, players }) => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [isRegistering2, setIsRegistering2] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Registration State
  const [regData, setRegData] = useState<Partial<Player & { password: string }>>({
    primaryPos: 1,
    secondaryPos: 7,
    reference: 'Otro'
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering2(true)
    setRegisterError('')

    try {
      const { api } = await import('../services/api')

      // Crear FormData para enviar imagen y datos
      const formData = new FormData()
      formData.append('nombre', regData.firstName || '')
      formData.append('apellido', regData.lastName || '')
      formData.append('fechaNacimiento', regData.birthDate || '')
      formData.append('dni', regData.dni || '')
      formData.append('telefono', regData.phone || '')
      formData.append('email', regData.email || '')
      formData.append('password', regData.password || '') // Usar la contraseña del formulario
      formData.append('tipo', 'jugador')

      // Enviar posiciones como números
      formData.append('posicionPrimaria', String(regData.primaryPos || 1))
      formData.append('posicionSecundaria', String(regData.secondaryPos || 7))
      formData.append('isActive', 'true')

      // Agregar imagen si existe
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      const response = await api.registerUser(formData)

      // Crear jugador local con los datos registrados
      const newPlayer: Player = {
        id: response.id || crypto.randomUUID(),
        dni: regData.dni || '',
        firstName: regData.firstName || '',
        lastName: regData.lastName || '',
        birthDate: regData.birthDate || '',
        phone: regData.phone || '',
        email: regData.email || '',
        primaryPos: Number(regData.primaryPos),
        secondaryPos: Number(regData.secondaryPos),
        reference: (regData.reference as PlayerReference) || 'Otro',
        role: 'JUGADOR'
      }

      onRegister(newPlayer)
      setSuccessMessage('¡Registro exitoso! Redirigiendo al login...')

      // Limpiar formulario
      setRegData({
        primaryPos: 1,
        secondaryPos: 7,
        reference: 'Otro'
      })
      setPreviewUrl(null)
      setSelectedFile(null)

      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        setIsRegistering(false)
        setSuccessMessage('')
      }, 2000)
    } catch (error: any) {
      console.error('Registration error:', error)

      // Mostrar el mensaje de error específico del backend si está disponible
      const errorMessage = error?.message || 'Error en el registro. Intenta nuevamente.'
      setRegisterError(errorMessage)
    } finally {
      setIsRegistering2(false)
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
          {!isRegistering ? (
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
                <button type="button" onClick={() => setIsRegistering(true)} className="text-sm font-bold text-emerald-600 hover:underline">
                  ¿No tienes cuenta? Regístrate acá
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <h3 className="font-black text-slate-800 text-xl mb-4">Registro de Jugador</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  required
                  placeholder="Nombre"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                />
                <input
                  required
                  placeholder="Apellido"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                />
                <input
                  required
                  placeholder="DNI"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, dni: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
                <input
                  required
                  type="password"
                  placeholder="Contraseña"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
                <input
                  required
                  type="date"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, birthDate: e.target.value })}
                />
                <input
                  required
                  type="tel"
                  placeholder="Celular"
                  className="p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                />

                {/* Photo upload section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Foto del Jugador</label>
                  <div className="flex flex-col items-center space-y-3">
                    {previewUrl && (
                      <div className="relative">
                        <img src={previewUrl} alt="Vista previa" className="w-24 h-24 rounded-full object-cover border-2 border-slate-200" />
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      {previewUrl ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">Tamaño recomendado: 200x200px</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Posición Primaria</label>
                  <select
                    className="p-3 bg-slate-50 border rounded-xl w-full"
                    value={regData.primaryPos}
                    onChange={(e) => {
                      const newPrimaryPos = Number(e.target.value)
                      const availableSecondary = getAvailableSecondaryPositions(newPrimaryPos)
                      const firstAvailableSecondary = Number(Object.keys(availableSecondary)[0])
                      setRegData({
                        ...regData,
                        primaryPos: newPrimaryPos,
                        secondaryPos: firstAvailableSecondary
                      })
                    }}
                  >
                    {Object.entries(PositionNames).map(([v, n]) => (
                      <option key={v} value={v}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Posición Secundaria</label>
                  <select
                    className="p-3 bg-slate-50 border rounded-xl w-full"
                    value={regData.secondaryPos}
                    onChange={(e) => setRegData({ ...regData, secondaryPos: Number(e.target.value) })}
                    disabled={!regData.primaryPos}
                  >
                    {Object.entries(getAvailableSecondaryPositions(regData.primaryPos || 1)).map(([v, n]) => (
                      <option key={v} value={v}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center font-medium">{successMessage}</div>
              )}
              {registerError && <p className="text-red-500 text-sm font-medium px-1 text-center">{registerError}</p>}
              <button
                type="submit"
                disabled={isRegistering2}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRegistering2 ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Registrarme'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false)
                  setSuccessMessage('')
                  setRegisterError('')
                }}
                className="w-full text-sm font-bold text-slate-400"
              >
                Volver al Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
