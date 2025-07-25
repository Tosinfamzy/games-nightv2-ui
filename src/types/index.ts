// Common Types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Session Types
export interface Session extends BaseEntity {
  name: string
  description?: string
  date: string
  location?: string
  status: SessionStatus
  host: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  joinCode: string
  games?: Array<Game>
  teams?: Array<Team>
  players?: Array<Player>
}

export interface JoinSessionRequest {
  joinCode: string
  playerName: string
}

export interface JoinSessionResponse {
  session: Session
  message: string
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Game Types
export interface Game extends BaseEntity {
  name: string
  description?: string
  maxPlayers: number
  minPlayers: number
  status: GameStatus
  sessionId: string
  currentRound: number
  maxRounds: number
  startTime?: string
  endTime?: string
}

export enum GameStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Team Types
export interface Team extends BaseEntity {
  name: string
  gameId: string
  players: Array<Player>
}

// Player Types
export interface Player extends BaseEntity {
  name: string
  email?: string
  teamId?: string
}

// Score Types
export interface Score extends BaseEntity {
  points: number
  roundNumber: number
  teamId: string
  gameId: string
  notes?: string
}

export interface TeamScore {
  teamId: string
  teamName: string
  totalPoints: number
  roundPoints: Array<{
    roundNumber: number
    points: number
  }>
}
