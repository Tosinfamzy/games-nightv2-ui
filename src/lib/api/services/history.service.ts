import { fetchAPI } from '../client'
import type {
  GameResult,
  PlayerStats,
  QueryHistoryParams,
  UUID,
} from '../types'

class HistoryService {
  private readonly basePath = '/history'

  /**
   * Get game history with optional filters
   */
  async getGameHistory(params?: QueryHistoryParams): Promise<GameResult[]> {
    const queryParams = new URLSearchParams()

    if (params?.sessionId) {
      queryParams.append('sessionId', params.sessionId)
    }
    if (params?.playerId) {
      queryParams.append('playerId', params.playerId)
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
      ? `${this.basePath}/games?${queryString}`
      : `${this.basePath}/games`

    return fetchAPI<GameResult[]>(url)
  }

  /**
   * Get a specific game result by ID
   */
  async getGameResultById(gameResultId: UUID): Promise<GameResult> {
    return fetchAPI<GameResult>(`${this.basePath}/games/${gameResultId}`)
  }

  /**
   * Get statistics for a specific player
   */
  async getPlayerStats(playerId: UUID): Promise<PlayerStats> {
    return fetchAPI<PlayerStats>(`${this.basePath}/players/${playerId}/stats`)
  }

  /**
   * Get leaderboard (top players by win rate)
   */
  async getLeaderboard(limit: number = 10): Promise<PlayerStats[]> {
    return fetchAPI<PlayerStats[]>(
      `${this.basePath}/leaderboard?limit=${limit}`,
    )
  }
}

export const historyService = new HistoryService()
