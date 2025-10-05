// Common types
export type UUID = string

export * from './common'

// Session types
export interface Session {
  id: UUID
  name: string
  description?: string
  date: string
  location?: string
  status: SessionStatus
  joinCode: string
  host: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  createdAt: string
  updatedAt: string
  games?: Array<Game>
  teams?: Array<Team>
  players?: Array<Player>
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Game types
export interface Game {
  id: UUID
  name: string
  description: string
  status: GameStatus
  currentRound: number
  maxRounds: number
  minPlayers: number
  maxPlayers: number
  startTime?: string
  endTime?: string
  sessionId: UUID
  scores: Array<Score>
  teams: Array<Team>
}

export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Team types
export interface Team {
  id: UUID
  name: string
  players: Array<Player>
  scores: Array<Score>
  gameId: UUID
}

// Player types
export interface Player {
  id: UUID
  name: string
  email: string
  teams: Array<Team>
  teamId?: string // Legacy compatibility
}

// Score types
export interface Score {
  id: UUID
  points: number
  roundNumber: number
  teamId: UUID
  gameId: UUID
  createdAt: string
  updatedAt: string
}

export interface TeamScore {
  teamId: UUID
  teamName: string
  totalPoints: number
  roundPoints: Array<{
    roundNumber: number
    points: number
  }>
}

// Join session types
export interface JoinSessionRequest {
  joinCode: string
  playerName: string
}

export interface JoinSessionResponse {
  session: Session
  message: string
}

// Session DTOs
export interface CreateSessionDTO {
  name: string
  description?: string
  gamesMasterId: string
  date: string
  location?: string
}

export interface UpdateSessionDTO extends Partial<CreateSessionDTO> {
  status?: Session['status']
}

// Player DTOs
export interface CreatePlayerDTO {
  name: string
  email?: string
  sessionId?: string // Optional for compatibility
}

export interface UpdatePlayerDTO extends Partial<CreatePlayerDTO> {}
