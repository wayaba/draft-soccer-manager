export enum PosicionJugador {
  ARQUERO = 1,
  DEFENSOR_CENTRAL = 2,
  DEFENSOR_LATERAL_IZQ = 3,
  DEFENSOR_LATERAL_DER = 4,
  VOLANTE_CENTRAL = 5,
  VOLANTE_DEFENSIVO = 6,
  DELANTERO_DER = 7,
  VOLANTE_ATAQUE = 8,
  DELANTERO_CENTRAL = 9,
  VOLANTE_ATAQUE_10 = 10,
  DELANTERO_IZQ = 11
}

// Mapeo de posiciones para mostrar descripciones completas en el frontend
export const PosicionJugadorDescripcion = {
  [PosicionJugador.ARQUERO]: '1 - Arquero',
  [PosicionJugador.DEFENSOR_CENTRAL]: '2 - Defensor Central',
  [PosicionJugador.DEFENSOR_LATERAL_IZQ]: '3 - Defensor Lateral Izq',
  [PosicionJugador.DEFENSOR_LATERAL_DER]: '4 - Defensor Lateral Der',
  [PosicionJugador.VOLANTE_CENTRAL]: '5 - Volante Central',
  [PosicionJugador.VOLANTE_DEFENSIVO]: '6 - Volante Defensivo',
  [PosicionJugador.DELANTERO_DER]: '7 - Delantero Der',
  [PosicionJugador.VOLANTE_ATAQUE]: '8 - Volante Ataque',
  [PosicionJugador.DELANTERO_CENTRAL]: '9 - Delantero Central',
  [PosicionJugador.VOLANTE_ATAQUE_10]: '10 - Volante Ataque',
  [PosicionJugador.DELANTERO_IZQ]: '11 - Delantero Izq'
} as const

export enum Position {
  GK = 1,
  RB = 2,
  CB_L = 3,
  CB_R = 4,
  LB = 5,
  CDM = 6,
  RM = 7,
  CM = 8,
  LM = 9,
  ST_L = 10,
  ST_R = 11
}

export const PositionNames: Record<number, string> = PosicionJugadorDescripcion

// Función helper para obtener las posiciones disponibles para posición secundaria
export const getAvailableSecondaryPositions = (primaryPos: number): Record<number, string> => {
  const positions = { ...PositionNames }
  delete positions[primaryPos]
  return positions
}

export type UserRole = 'ADMIN' | 'DELEGADO' | 'JUGADOR'

export type PlayerReference =
  | 'Padre de Alumno'
  | 'Ex Alumno Egresado >34'
  | 'Padre de Alumno Egresado'
  | 'Docente'
  | 'Invitado'
  | 'Otro'
  | 'Padre de Alumno No Egresado'

export interface Player {
  id: string
  dni: string
  lastName: string
  firstName: string
  birthDate: string
  phone: string
  email: string
  primaryPos: number
  secondaryPos: number
  reference: PlayerReference
  teamId?: string
  role: UserRole
  avatar?: string // URL del avatar o base64 de la imagen
  puntaje?: number // Puntaje del jugador (0-100)
}

export interface Team {
  id: string
  name: string
  delegateId: string // Referencia al ID del jugador que es delegado
  delegateName: string
  players: Player[]
}

export interface DraftState {
  isStarted: boolean
  currentTurnIndex: number
  turnOrder: string[]
  isSnakeReversed: boolean
  history: string[]
}

export interface AuthSession {
  userId: string
  role: UserRole
  name: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    nombre: string
    apellido: string
    tipo: string
    avatar: string | null
  }
}
