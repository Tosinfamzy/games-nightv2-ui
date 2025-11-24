/* eslint-disable @typescript-eslint/array-type */
// Common types
export type UUID = string

export * from './common'
export * from './chat'

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
  // Resource IDs (use dedicated endpoints to fetch full objects)
  gameIds: string[]
  teamIds: string[]
  playerIds: string[]
  // Counts for quick reference
  gamesCount: number
  teamsCount: number
  playersCount: number
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
  color?: string
  position: number
  isActive: boolean
  sessionId?: string | null
  gameId?: string | null
  playerIds: string[]
  scoreIds: string[]
  createdAt: string
  updatedAt: string
}

// Player types
export interface Player {
  id: UUID
  name: string
  email: string
  status: 'joined' | 'ready' | 'playing' | 'disconnected'
  isOnline: boolean
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

// Results and Leaderboard types
export interface TeamStanding {
  teamId: UUID
  teamName: string
  rank: number
  totalPoints: number
  bonusPointsCount: number
  roundPoints: Record<number, number>
  isTied?: boolean
}

export interface GameResults {
  gameId: UUID
  gameName: string
  status: string
  winnerId: UUID | null
  winnerName: string | null
  winningScore: number | null
  completedAt: string | null
  standings: Array<TeamStanding>
  roundsCompleted: number
  isTied: boolean
}

export interface SessionTeamStanding {
  teamId: UUID
  teamName: string
  rank: number
  totalPoints: number
  gamesWon: number
  gamesPlayed: number
  gamePoints: Record<string, number>
  averagePoints: number
}

export interface SessionLeaderboard {
  sessionId: UUID
  sessionName: string
  status: string
  championId: UUID | null
  championName: string | null
  standings: Array<SessionTeamStanding>
  gamesCompleted: number
  teamsCount: number
  completedAt: string | null
}

// Timer event types
export interface TimerTickEvent {
  gameId: UUID
  timeRemaining: number
  timestamp: string
}

export interface TurnStartedEvent {
  gameId: UUID
  teamId: UUID
  teamName: string
  turnTimeLimit: number | null
  turnStartedAt: string
  turnEndsAt: string | null
  timestamp: string
}

export interface TurnAdvancedEvent {
  gameId: UUID
  previousTeamId: UUID
  nextTeamId: UUID
  nextTeamName: string
  turnTimeLimit: number | null
  turnStartedAt: string
  turnEndsAt: string | null
  autoAdvanced: boolean
  timestamp: string
}

export interface TimerExpiredEvent {
  gameId: UUID
  teamName: string
  timestamp: string
}
