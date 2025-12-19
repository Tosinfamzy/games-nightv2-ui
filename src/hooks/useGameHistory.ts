import { useQuery } from '@tanstack/react-query'
import { historyService } from '../lib/api/services'
import type { UUID, QueryHistoryParams } from '../lib/api/types'

const GAME_HISTORY_KEY = 'game-history'
const PLAYER_STATS_KEY = 'player-stats'
const LEADERBOARD_KEY = 'leaderboard'

/**
 * Get game history with optional filters
 */
export const useGameHistory = (params?: QueryHistoryParams) => {
  return useQuery({
    queryKey: [GAME_HISTORY_KEY, params],
    queryFn: () => historyService.getGameHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get a specific game result by ID
 */
export const useGameResult = (gameResultId: UUID | undefined) => {
  return useQuery({
    queryKey: [GAME_HISTORY_KEY, gameResultId],
    queryFn: () => {
      if (!gameResultId) throw new Error('Game result ID is required')
      return historyService.getGameResultById(gameResultId)
    },
    enabled: Boolean(gameResultId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get statistics for a specific player
 */
export const usePlayerStats = (playerId: UUID | undefined) => {
  return useQuery({
    queryKey: [PLAYER_STATS_KEY, playerId],
    queryFn: () => {
      if (!playerId) throw new Error('Player ID is required')
      return historyService.getPlayerStats(playerId)
    },
    enabled: Boolean(playerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get leaderboard (top players by win rate)
 */
export const useLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: [LEADERBOARD_KEY, limit],
    queryFn: () => historyService.getLeaderboard(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
