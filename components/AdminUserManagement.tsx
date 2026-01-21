import React, { useState, useEffect } from 'react'
import { Player, PositionNames, EstadoJugador, EstadoJugadorDescripcion } from '../types'
import { Search, Star, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import Avatar from './Avatar'
import { validatePuntaje } from '../utils/validation'
import { api } from '../services/api'

interface Props {
  players: Player[]
  onPlayersUpdate: () => void
}

interface PuntajeEdit {
  userId: string
  puntaje: string
  isValid: boolean
  errorMessage?: string
}

interface EstadoEdit {
  userId: string
  estado: EstadoJugador
}

const AdminUserManagement: React.FC<Props> = ({ players, onPlayersUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'ALL' | 'JUGADOR' | 'DELEGADO'>('ALL')
  const [editingPuntajes, setEditingPuntajes] = useState<{ [key: string]: PuntajeEdit }>({})
  const [savingPuntajes, setSavingPuntajes] = useState<{ [key: string]: boolean }>({})
  const [successMessages, setSuccessMessages] = useState<{ [key: string]: string }>({})
  const [editingEstados, setEditingEstados] = useState<{ [key: string]: EstadoEdit }>({})
  const [savingEstados, setSavingEstados] = useState<{ [key: string]: boolean }>({})

  // Calcular edad
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Filtrar jugadores y delegados (excluir admins)
  const eligibleUsers = players.filter((p) => p.role === 'JUGADOR' || p.role === 'DELEGADO')

  const filteredUsers = eligibleUsers.filter((p) => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dni.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'ALL' || p.role === filterRole
    return matchesSearch && matchesRole
  })

  // Manejar inicio de edición de puntaje
  const startEditingPuntaje = (userId: string, currentPuntaje?: number) => {
    setEditingPuntajes((prev) => ({
      ...prev,
      [userId]: {
        userId,
        puntaje: currentPuntaje?.toString() || '',
        isValid: true
      }
    }))
  }

  // Manejar cambio en el puntaje
  const handlePuntajeChange = (userId: string, value: string) => {
    const validation = validatePuntaje(value)
    setEditingPuntajes((prev) => ({
      ...prev,
      [userId]: {
        userId,
        puntaje: value,
        isValid: validation.isValid,
        errorMessage: validation.message
      }
    }))
  }

  // Cancelar edición
  const cancelEdit = (userId: string) => {
    setEditingPuntajes((prev) => {
      const newState = { ...prev }
      delete newState[userId]
      return newState
    })
  }

  // Guardar puntaje
  const savePuntaje = async (userId: string) => {
    const editData = editingPuntajes[userId]
    if (!editData || !editData.isValid) return

    setSavingPuntajes((prev) => ({ ...prev, [userId]: true }))

    try {
      await api.updatePuntaje(userId, parseFloat(editData.puntaje))

      // Mostrar mensaje de éxito
      setSuccessMessages((prev) => ({ ...prev, [userId]: 'Puntaje actualizado exitosamente' }))
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
      }, 3000)

      // Limpiar edición
      cancelEdit(userId)

      // Actualizar lista de jugadores
      onPlayersUpdate()
    } catch (error: any) {
      alert(`Error al actualizar puntaje: ${error.message}`)
    } finally {
      setSavingPuntajes((prev) => ({ ...prev, [userId]: false }))
    }
  }

  // Funciones para manejar edición de estados
  const startEditingEstado = (userId: string, estadoActual?: EstadoJugador) => {
    setEditingEstados((prev) => ({
      ...prev,
      [userId]: {
        userId,
        estado: estadoActual || EstadoJugador.ACTIVO
      }
    }))
  }

  const cancelEditEstado = (userId: string) => {
    setEditingEstados((prev) => {
      const newState = { ...prev }
      delete newState[userId]
      return newState
    })
  }

  const handleEstadoChange = (userId: string, nuevoEstado: EstadoJugador) => {
    setEditingEstados((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        estado: nuevoEstado
      }
    }))
  }

  const saveEstado = async (userId: string) => {
    const edit = editingEstados[userId]
    if (!edit) return

    setSavingEstados((prev) => ({ ...prev, [userId]: true }))

    try {
      await api.updatePlayerStatus(userId, edit.estado)

      // Mostrar mensaje de éxito
      setSuccessMessages((prev) => ({ ...prev, [userId]: 'Estado actualizado exitosamente' }))
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
      }, 3000)

      // Limpiar edición
      cancelEditEstado(userId)

      // Actualizar lista de jugadores
      onPlayersUpdate()
    } catch (error: any) {
      alert(`Error al actualizar estado: ${error.message}`)
    } finally {
      setSavingEstados((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500">Actualizar puntajes de jugadores y delegados.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
            >
              <option value="ALL">Todos los roles</option>
              <option value="JUGADOR">Solo jugadores</option>
              <option value="DELEGADO">Solo delegados</option>
            </select>
          </div>

          <div className="text-sm text-slate-500 font-medium">
            Mostrando {filteredUsers.length} de {eligibleUsers.length} usuarios
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">DNI / Edad</th>
                <th className="px-6 py-4">Posiciones</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Puntaje</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isEditing = editingPuntajes[user.id]
                const isSaving = savingPuntajes[user.id]
                const successMessage = successMessages[user.id]
                const isEditingEstado = editingEstados[user.id]
                const isSavingEstado = savingEstados[user.id]

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} firstName={user.firstName} lastName={user.lastName} size="lg" />
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.lastName}, {user.firstName}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p className="font-mono">{user.dni}</p>
                      <p className="text-xs text-slate-400">{calculateAge(user.birthDate)} años</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold w-fit uppercase">
                          P: {PositionNames[user.primaryPos]}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold w-fit uppercase">
                          S: {PositionNames[user.secondaryPos]}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'DELEGADO' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {user.role === 'DELEGADO' ? 'Delegado' : 'Jugador'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {isEditingEstado ? (
                        <div className="space-y-1">
                          <select
                            className="px-2 py-1 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={isEditingEstado.estado}
                            onChange={(e) => handleEstadoChange(user.id, Number(e.target.value) as EstadoJugador)}
                          >
                            {Object.entries(EstadoJugadorDescripcion).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.estado === EstadoJugador.ACTIVO
                              ? 'bg-green-100 text-green-700'
                              : user.estado === EstadoJugador.EVENTUAL
                                ? 'bg-orange-100 text-orange-700'
                                : user.estado === EstadoJugador.LISTA_ESPERA
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : user.estado === EstadoJugador.BAJA
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {EstadoJugadorDescripcion[user.estado || EstadoJugador.ACTIVO]}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className={`w-20 px-2 py-1 text-center text-sm rounded-lg border outline-none focus:ring-2 ${
                              isEditing.isValid ? 'border-slate-200 focus:ring-emerald-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                            }`}
                            value={isEditing.puntaje}
                            onChange={(e) => handlePuntajeChange(user.id, e.target.value)}
                            placeholder="0-100"
                          />
                          {!isEditing.isValid && <p className="text-xs text-red-600 max-w-20 text-center">{isEditing.errorMessage}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {user.puntaje !== undefined ? (
                            <>
                              <Star className="text-yellow-500" size={16} />
                              <span className="font-bold text-slate-700">{user.puntaje}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">Sin puntaje</span>
                          )}
                          {successMessage && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={14} />
                              <span className="text-xs">Guardado</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing || isEditingEstado ? (
                          <>
                            {isEditing && (
                              <>
                                <button
                                  onClick={() => savePuntaje(user.id)}
                                  disabled={!isEditing.isValid || isSaving}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Guardar puntaje"
                                >
                                  {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Save size={18} />
                                  )}
                                </button>
                                <button
                                  onClick={() => cancelEdit(user.id)}
                                  disabled={isSaving}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Cancelar"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            {isEditingEstado && (
                              <>
                                <button
                                  onClick={() => saveEstado(user.id)}
                                  disabled={isSavingEstado}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Guardar estado"
                                >
                                  {isSavingEstado ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Save size={18} />
                                  )}
                                </button>
                                <button
                                  onClick={() => cancelEditEstado(user.id)}
                                  disabled={isSavingEstado}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Cancelar"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => startEditingPuntaje(user.id, user.puntaje)}
                              className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border border-emerald-200"
                            >
                              {user.puntaje !== undefined ? 'Editar' : 'Asignar'} Puntaje
                            </button>
                            <button
                              onClick={() => startEditingEstado(user.id, user.estado)}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-blue-200"
                            >
                              Cambiar Estado
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={48} className="text-slate-300" />
                      <p className="text-lg font-medium">No se encontraron usuarios</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUserManagement
