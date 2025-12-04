/* eslint-disable @typescript-eslint/array-type */
/**
 * Component-specific types for UI rendering
 * These types represent enriched data structures optimized for component consumption
 * They differ from API types which are lean and ID-based
 */

export type UUID = string

// UI Player type with normalized status
export interface UIPlayer {
  id: UUID
  name: string
  email: string
  status: 'ready' | 'not_ready' | 'playing'
  teamId?: string
  isOnline: boolean
}

// UI Team type with enriched player data
export interface UITeam {
  id: UUID
  name: string
  color?: string
  position: number
  isActive: boolean
  sessionId?: string | null
  gameId?: string | null
  players: UIPlayer[]
  scoreIds: string[]
  createdAt: string
  updatedAt: string
}

// UI Game type with normalized status
export interface UIGame {
  id: UUID
  name: string
  description?: string
  minPlayers: number
  maxPlayers: number
  status: 'scheduled' | 'in_progress' | 'completed'
  recommendedTeamSize?: number
}

// Extended UI Game with additional metadata (for game library/selection)
export interface UIGameWithMetadata extends UIGame {
  estimatedDuration?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}
