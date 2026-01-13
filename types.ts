
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

export const PositionNames: Record<number, string> = {
  1: "Arquero (1)",
  2: "Lat. Derecho (2)",
  3: "Central Izq. (3)",
  4: "Central Der. (4)",
  5: "Lat. Izquierdo (5)",
  6: "Vol. Tapón (6)",
  7: "Vol. Derecho (7)",
  8: "Vol. Central (8)",
  9: "Vol. Izquierdo (9)",
  10: "Delantero Izq. (10)",
  11: "Delantero Der. (11)"
};

export type PlayerReference = 
  | "Padre de Alumno" 
  | "Ex Alumno Egresado >34" 
  | "Padre de Alumno Egresado" 
  | "Docente" 
  | "Invitado" 
  | "Otro" 
  | "Padre de Alumno No Egresado";

export interface Player {
  id: string;
  dni: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  phone: string;
  email: string;
  primaryPos: number;
  secondaryPos: number;
  reference: PlayerReference;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  delegateName: string;
  players: Player[];
}

export interface DraftState {
  isStarted: boolean;
  currentTurnIndex: number; // Index in the order array
  turnOrder: string[]; // Array of team IDs
  isSnakeReversed: boolean;
  history: string[]; // Player IDs selected
}
