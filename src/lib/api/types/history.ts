import type { UUID } from './index'

export interface FinalScore {
  teamId: string
  teamName: string
  score: number
  rank: number
}

export interface GameResult {
  id: UUID
  gameId: UUID
  sessionId: UUID
  gameName: string
  winningTeamName?: string
  finalScores: FinalScore[]
  completedAt: string
  durationMinutes: number
  totalRounds: number
  teamCount: number
  isTied: boolean
}

export interface PlayerStats {
  playerId: UUID
  playerName: string
  gamesPlayed: number
  gamesWon: number
  winRate: number
  totalScore: number
  averageScore: number
  favoriteGame?: string
  lastPlayedAt?: string
}

export interface QueryHistoryParams {
  sessionId?: UUID
  playerId?: UUID
  limit?: number
  offset?: number
}
