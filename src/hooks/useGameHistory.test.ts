import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import {
  useGameHistory,
  usePlayerStats,
  useLeaderboard,
} from './useGameHistory'
import {
  renderHookWithProviders,
  createTestQueryClient,
} from '../test/test-utils'
import { historyService } from '../lib/api/services'
import type { GameResult, PlayerStats } from '../lib/api/types'

// Mock the historyService
vi.mock('../lib/api/services', () => ({
  historyService: {
    getGameHistory: vi.fn(),
    getPlayerStats: vi.fn(),
    getLeaderboard: vi.fn(),
  },
}))

describe('useGameHistory', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  const mockGameResults: GameResult[] = [
    {
      id: 'result-1',
      gameId: 'game-1',
      sessionId: 'session-1',
      gameName: 'Chess',
      winningTeamName: 'Team A',
      finalScores: [
        { teamId: 'team-a', teamName: 'Team A', score: 100, rank: 1 },
        { teamId: 'team-b', teamName: 'Team B', score: 85, rank: 2 },
      ],
      completedAt: '2025-12-14T15:30:00Z',
      durationMinutes: 45,
      totalRounds: 3,
      teamCount: 2,
      isTied: false,
    },
  ]

  const mockPlayerStats: PlayerStats = {
    playerId: 'player-1',
    playerName: 'John Doe',
    gamesPlayed: 15,
    gamesWon: 8,
    winRate: 0.533,
    totalScore: 1250,
    averageScore: 83.33,
    favoriteGame: 'Chess',
    lastPlayedAt: '2025-12-14T15:30:00Z',
  }

  const mockLeaderboard: PlayerStats[] = [
    {
      playerId: 'player-1',
      playerName: 'Alice',
      gamesPlayed: 20,
      gamesWon: 15,
      winRate: 0.75,
      totalScore: 2000,
      averageScore: 100,
    },
    {
      playerId: 'player-2',
      playerName: 'Bob',
      gamesPlayed: 18,
      gamesWon: 12,
      winRate: 0.667,
      totalScore: 1800,
      averageScore: 100,
    },
  ]

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.mocked(historyService.getGameHistory).mockResolvedValue(mockGameResults)
    vi.mocked(historyService.getPlayerStats).mockResolvedValue(mockPlayerStats)
    vi.mocked(historyService.getLeaderboard).mockResolvedValue(mockLeaderboard)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useGameHistory', () => {
    it('should fetch game history on mount', async () => {
      const { result } = renderHookWithProviders(() => useGameHistory(), {
        queryClient,
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockGameResults)
      expect(historyService.getGameHistory).toHaveBeenCalledWith(undefined)
      expect(historyService.getGameHistory).toHaveBeenCalledTimes(1)
    })

    it('should filter game history by sessionId', async () => {
      const sessionId = 'session-123'
      const { result } = renderHookWithProviders(
        () => useGameHistory({ sessionId }),
        { queryClient },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(historyService.getGameHistory).toHaveBeenCalledWith({ sessionId })
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Failed to fetch history')
      vi.mocked(historyService.getGameHistory).mockRejectedValue(error)

      const { result } = renderHookWithProviders(() => useGameHistory(), {
        queryClient,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('usePlayerStats', () => {
    it('should fetch player stats when playerId is provided', async () => {
      const playerId = 'player-1'
      const { result } = renderHookWithProviders(
        () => usePlayerStats(playerId),
        { queryClient },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockPlayerStats)
      expect(historyService.getPlayerStats).toHaveBeenCalledWith(playerId)
    })

    it('should not fetch when playerId is undefined', () => {
      const { result } = renderHookWithProviders(
        () => usePlayerStats(undefined),
        { queryClient },
      )

      expect(result.current.isLoading).toBe(false)
      expect(historyService.getPlayerStats).not.toHaveBeenCalled()
    })

    it('should handle errors when fetching player stats', async () => {
      const error = new Error('Player not found')
      vi.mocked(historyService.getPlayerStats).mockRejectedValue(error)

      const { result } = renderHookWithProviders(
        () => usePlayerStats('player-1'),
        { queryClient },
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useLeaderboard', () => {
    it('should fetch leaderboard with default limit', async () => {
      const { result } = renderHookWithProviders(() => useLeaderboard(), {
        queryClient,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockLeaderboard)
      expect(historyService.getLeaderboard).toHaveBeenCalledWith(10)
    })

    it('should fetch leaderboard with custom limit', async () => {
      const { result } = renderHookWithProviders(() => useLeaderboard(20), {
        queryClient,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(historyService.getLeaderboard).toHaveBeenCalledWith(20)
    })

    it('should verify leaderboard is sorted by win rate', async () => {
      const { result } = renderHookWithProviders(() => useLeaderboard(), {
        queryClient,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const leaderboard = result.current.data
      expect(leaderboard).toBeDefined()
      if (leaderboard && leaderboard.length > 1) {
        // Verify first player has higher or equal win rate than second
        expect(leaderboard[0].winRate).toBeGreaterThanOrEqual(
          leaderboard[1].winRate,
        )
      }
    })
  })
})
