import { LoginResponse, EstadoJugador } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Funciones auxiliares para el Mock
const getMockData = (key: string) => JSON.parse(localStorage.getItem(`mock_${key}`) || '[]')
const saveMockData = (key: string, data: any) => localStorage.setItem(`mock_${key}`, JSON.stringify(data))

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK) {
      await delay(500)
      // Mock response para desarrollo
      return {
        access_token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: '1',
          email: email,
          nombre: 'Usuario',
          apellido: 'Mock',
          tipo: email === 'admin@email.com' ? 'admin' : 'jugador',
          avatar: null
        }
      }
    }
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      throw new Error('Error en el login')
    }

    return res.json()
  },

  async registerUser(formData: FormData) {
    if (USE_MOCK) {
      await delay(800)
      // Mock response para registro
      return {
        id: crypto.randomUUID(),
        message: 'Usuario registrado exitosamente'
      }
    }

    const token = localStorage.getItem('auth_token')

    // Convertir FormData a objeto JSON con tipos correctos
    const jsonData: any = {}
    const avatarFile = formData.get('avatar')

    for (const [key, value] of formData.entries()) {
      if (key === 'isActive') {
        jsonData[key] = value === 'true' // Boolean
      } else if (key === 'posicionPrimaria' || key === 'posicionSecundaria' || key === 'estado') {
        jsonData[key] = parseInt(value as string) // Número para enum
      } else if (key === 'dni') {
        jsonData[key] = parseInt(value as string) // DNI como número
      } else if (key !== 'avatar') {
        jsonData[key] = value
      }
    }

    // Convertir imagen a base64 si existe
    if (avatarFile && avatarFile instanceof File) {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(avatarFile)
      })

      const base64Image = await base64Promise
      jsonData.avatar = base64Image
    }

    // Siempre usar JSON para consistencia de tipos
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })

    if (!res.ok) {
      // Intentar extraer el mensaje de error específico del backend
      let errorMessage = 'Error en el registro'
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        // Si no se puede parsear, usar mensaje genérico
        errorMessage = `Error ${res.status}: ${res.statusText}`
      }
      throw new Error(errorMessage)
    }

    return res.json()
  },

  async getPlayers() {
    if (USE_MOCK) {
      await delay(800)
      return getMockData('players')
    }

    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/users?isActive=true&page=1&limit=100`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    if (!res.ok) {
      throw new Error('Error al obtener jugadores')
    }

    const response = await res.json()
    // Si la respuesta tiene estructura de paginación, extraer el array de usuarios
    const users = response.data || response.users || response || []

    // Mapear formato del backend al formato del frontend
    return users.map((user: any) => ({
      id: user.id,
      dni: String(user.dni || ''),
      firstName: user.nombre || '',
      lastName: user.apellido || '',
      birthDate: user.fechaNacimiento ? user.fechaNacimiento.split('T')[0] : '',
      phone: user.telefono || '',
      email: user.email || '',
      primaryPos: user.posicionPrimaria || 1,
      secondaryPos: user.posicionSecundaria || 7,
      role: user.tipo === 'admin' ? 'ADMIN' : user.tipo === 'delegado' ? 'DELEGADO' : 'JUGADOR',
      teamId: user.teamId,
      avatar: user.avatar?.secure_url || null,
      puntaje: user.puntaje, // Mapear el campo puntaje desde el backend
      estado: user.estado // Mapear el campo estado desde el backend
    }))
  },

  async createPlayer(player: any) {
    if (USE_MOCK) {
      await delay(600)
      const players = getMockData('players')
      const newPlayer = { ...player, id: player.id || crypto.randomUUID() }
      players.push(newPlayer)
      saveMockData('players', players)
      return newPlayer
    }
    const res = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    })
    return res.json()
  },

  async updatePlayer(id: string, data: any) {
    if (USE_MOCK) {
      await delay(500)
      const players = getMockData('players')
      const index = players.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        players[index] = { ...players[index], ...data }
        saveMockData('players', players)
      }
      return players[index]
    }
    const res = await fetch(`${API_URL}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async getTeams() {
    if (USE_MOCK) {
      await delay(700)
      return getMockData('teams')
    }

    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/equipos`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    if (!res.ok) {
      throw new Error('Error al obtener equipos')
    }

    const response = await res.json()
    // Extraer array de equipos y mapear al formato del frontend
    const teams = response.data || response.teams || response || []

    return teams.map((team: any) => ({
      id: team._id,
      name: team.name,
      delegateId: team.user?._id || '',
      delegateName: team.user ? `${team.user.nombre} ${team.user.apellido}` : '',
      players: (team.jugadores || []).map((jugador: any) => ({
        id: jugador._id,
        dni: '',
        firstName: jugador.nombre || '',
        lastName: jugador.apellido || '',
        birthDate: '',
        phone: '',
        email: jugador.email || '',
        primaryPos: 8, // Default, se podría mapear desde jugador.posicion si es necesario
        secondaryPos: 1,
        reference: 'Otro',
        role: 'JUGADOR',
        teamId: team._id
      }))
    }))
  },

  async createTeam(team: any) {
    if (USE_MOCK) {
      await delay(600)
      const teams = getMockData('teams')
      teams.push(team)
      saveMockData('teams', teams)
      return team
    }

    const token = localStorage.getItem('auth_token')

    // Preparar datos en el formato que espera el backend
    const teamData = {
      name: team.name,
      user: team.delegateId // ID del usuario delegado
    }

    const res = await fetch(`${API_URL}/equipos`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamData)
    })

    if (!res.ok) {
      throw new Error('Error al crear equipo')
    }

    return res.json()
  },

  async deleteTeam(teamId: string) {
    if (USE_MOCK) {
      await delay(400)
      const teams = getMockData('teams')
      const filteredTeams = teams.filter((t: any) => t.id !== teamId)
      saveMockData('teams', filteredTeams)
      return { success: true }
    }

    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/equipos/${teamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })

    if (!res.ok) {
      throw new Error('Error al eliminar equipo')
    }

    return res.json()
  },

  async getDraftState() {
    if (USE_MOCK) {
      await delay(500)
      const state = localStorage.getItem('mock_draft')
      return state ? JSON.parse(state) : null
    }
    const res = await fetch(`${API_URL}/draft`)
    return res.json()
  },

  async saveDraftState(state: any) {
    if (USE_MOCK) {
      await delay(400)
      saveMockData('draft', state)
      return state
    }
    const res = await fetch(`${API_URL}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    })
    return res.json()
  },

  async updatePuntaje(userId: string, puntaje: number) {
    if (USE_MOCK) {
      await delay(300)
      // Mock: actualizar en localStorage
      const players = getMockData('players')
      const playerIndex = players.findIndex((p: any) => p.id === userId)
      if (playerIndex !== -1) {
        players[playerIndex] = { ...players[playerIndex], puntaje }
        saveMockData('players', players)
        return { success: true, message: 'Puntaje actualizado exitosamente' }
      }
      throw new Error('Usuario no encontrado')
    }

    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/users/${userId}/puntaje`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ puntaje })
    })

    if (!res.ok) {
      let errorMessage = 'Error al actualizar puntaje'
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`
      }
      throw new Error(errorMessage)
    }

    return res.json()
  },

  async updatePlayerStatus(userId: string, estado: EstadoJugador) {
    if (USE_MOCK) {
      await delay(300)
      // Mock: actualizar en localStorage
      const players = getMockData('players')
      const playerIndex = players.findIndex((p: any) => p.id === userId)
      if (playerIndex !== -1) {
        players[playerIndex] = { ...players[playerIndex], estado }
        saveMockData('players', players)
        return { success: true, message: 'Estado actualizado exitosamente' }
      }
      throw new Error('Usuario no encontrado')
    }

    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado })
    })

    if (!res.ok) {
      let errorMessage = 'Error al actualizar estado'
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`
      }
      throw new Error(errorMessage)
    }

    return res.json()
  }
}
