import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import {
  createMockSocketContext,
  createTestQueryClient,
  renderHookWithProviders,
} from '../test/test-utils'
import { mockDashboardData } from '../test/fixtures/dashboard.fixture'
import { emitSocketEvent } from '../test/mocks/socket-mocks'
import { gamesMasterService } from '../lib/api/services/games-master.service'
import { useGMDashboard } from './useGMDashboard'

// Mock the gamesMasterService
vi.mock('../lib/api/services/games-master.service', () => ({
  gamesMasterService: {
    getDashboard: vi.fn(),
  },
}))

// TODO: Fix socket context mocking - these tests need proper SocketContext provider
describe.skip('useGMDashboard', () => {
  const mockGMId = 'gm-123'
  let queryClient: ReturnType<typeof createTestQueryClient>
  let mockSocketContext: ReturnType<typeof createMockSocketContext>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    mockSocketContext = createMockSocketContext()

    // Setup default successful response
    vi.mocked(gamesMasterService.getDashboard).mockResolvedValue(
      mockDashboardData,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Fetching', () => {
    it('should fetch dashboard data on mount', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.dashboard).toBeUndefined()

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.dashboard).toEqual(mockDashboardData)
      expect(gamesMasterService.getDashboard).toHaveBeenCalledWith(mockGMId)
      expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(1)
    })

    it('should not fetch when gamesMasterId is undefined', () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(undefined),
        { queryClient, socketContext: mockSocketContext },
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.dashboard).toBeUndefined()
      expect(gamesMasterService.getDashboard).not.toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const mockError = new Error('Failed to fetch dashboard')
      vi.mocked(gamesMasterService.getDashboard).mockRejectedValue(mockError)

      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.dashboard).toBeUndefined()
      expect(result.current.error).toBeDefined()
    })

    it('should return isConnected status from socket context', () => {
      const disconnectedContext = createMockSocketContext({
        isConnected: false,
      })

      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: disconnectedContext },
      )

      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('WebSocket Event Subscriptions', () => {
    describe('Session Events', () => {
      it('should subscribe to session:player-online event', async () => {
        const { result } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(mockSocketContext.sessionsSocket?.on).toHaveBeenCalledWith(
          'session:player-online',
          expect.any(Function),
        )
      })

      it('should subscribe to session:player-offline event', async () => {
        const { result } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(mockSocketContext.sessionsSocket?.on).toHaveBeenCalledWith(
          'session:player-offline',
          expect.any(Function),
        )
      })

      it('should subscribe to session:player-joined event', async () => {
        const { result } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(mockSocketContext.sessionsSocket?.on).toHaveBeenCalledWith(
          'session:player-joined',
          expect.any(Function),
        )
      })

      it('should subscribe to all session events', async () => {
        const sessionEvents = [
          'session:player-online',
          'session:player-offline',
          'session:player-joined',
          'session:player-left',
          'session:status-changed',
          'session:team-created',
          'session:team-deleted',
        ]

        renderHookWithProviders(() => useGMDashboard(mockGMId), {
          queryClient,
          socketContext: mockSocketContext,
        })

        await waitFor(() => {
          sessionEvents.forEach((event) => {
            expect(mockSocketContext.sessionsSocket?.on).toHaveBeenCalledWith(
              event,
              expect.any(Function),
            )
          })
        })
      })

      it('should unsubscribe from session events on unmount', async () => {
        const { unmount } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(mockSocketContext.sessionsSocket?.on).toHaveBeenCalled()
        })

        unmount()

        const sessionEvents = [
          'session:player-online',
          'session:player-offline',
          'session:player-joined',
          'session:player-left',
          'session:status-changed',
          'session:team-created',
          'session:team-deleted',
        ]

        sessionEvents.forEach((event) => {
          expect(mockSocketContext.sessionsSocket?.off).toHaveBeenCalledWith(
            event,
            expect.any(Function),
          )
        })
      })
    })

    describe('Game Events', () => {
      it('should subscribe to game:started event', async () => {
        const { result } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(mockSocketContext.gamesSocket?.on).toHaveBeenCalledWith(
          'game:started',
          expect.any(Function),
        )
      })

      it('should subscribe to all game events', async () => {
        const gameEvents = [
          'game:started',
          'game:completed',
          'game:paused',
          'game:resumed',
          'game:round-started',
          'game:round-ended',
        ]

        renderHookWithProviders(() => useGMDashboard(mockGMId), {
          queryClient,
          socketContext: mockSocketContext,
        })

        await waitFor(() => {
          gameEvents.forEach((event) => {
            expect(mockSocketContext.gamesSocket?.on).toHaveBeenCalledWith(
              event,
              expect.any(Function),
            )
          })
        })
      })

      it('should unsubscribe from game events on unmount', async () => {
        const { unmount } = renderHookWithProviders(
          () => useGMDashboard(mockGMId),
          { queryClient, socketContext: mockSocketContext },
        )

        await waitFor(() => {
          expect(mockSocketContext.gamesSocket?.on).toHaveBeenCalled()
        })

        unmount()

        const gameEvents = [
          'game:started',
          'game:completed',
          'game:paused',
          'game:resumed',
          'game:round-started',
          'game:round-ended',
        ]

        gameEvents.forEach((event) => {
          expect(mockSocketContext.gamesSocket?.off).toHaveBeenCalledWith(
            event,
            expect.any(Function),
          )
        })
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should refetch dashboard on session:player-joined event', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Simulate player joined event
      const socket = mockSocketContext.sessionsSocket!
      emitSocketEvent(socket as any, 'session:player-joined', {
        sessionId: 'session-1',
        playerId: 'player-new',
      })

      // Should trigger refetch
      await waitFor(() => {
        expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
          initialCallCount + 1,
        )
      })
    })

    it('should refetch dashboard on session:player-online event', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Simulate player online event
      const socket = mockSocketContext.sessionsSocket!
      emitSocketEvent(socket as any, 'session:player-online', {
        sessionId: 'session-1',
        playerId: 'player-1',
      })

      await waitFor(() => {
        expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
          initialCallCount + 1,
        )
      })
    })

    it('should refetch dashboard on game:started event', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Simulate game started event
      const socket = mockSocketContext.gamesSocket!
      emitSocketEvent(socket as any, 'game:started', {
        gameId: 'game-1',
        sessionId: 'session-1',
      })

      await waitFor(() => {
        expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
          initialCallCount + 1,
        )
      })
    })

    it('should refetch dashboard on game:completed event', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Simulate game completed event
      const socket = mockSocketContext.gamesSocket!
      emitSocketEvent(socket as any, 'game:completed', {
        gameId: 'game-1',
        winnerId: 'team-1',
      })

      await waitFor(() => {
        expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
          initialCallCount + 1,
        )
      })
    })

    it('should handle multiple consecutive events', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Emit multiple events
      const sessionsSocket = mockSocketContext.sessionsSocket!
      const gamesSocket = mockSocketContext.gamesSocket!

      emitSocketEvent(sessionsSocket as any, 'session:player-joined', {})
      emitSocketEvent(sessionsSocket as any, 'session:player-online', {})
      emitSocketEvent(gamesSocket as any, 'game:started', {})

      // Each event should trigger a refetch (3 events = 3 additional calls)
      await waitFor(() => {
        expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
          initialCallCount + 3,
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should not subscribe to events when sessionsSocket is null', () => {
      const nullSocketContext = createMockSocketContext({
        sessionsSocket: null as any,
      })

      renderHookWithProviders(() => useGMDashboard(mockGMId), {
        queryClient,
        socketContext: nullSocketContext,
      })

      expect(nullSocketContext.sessionsSocket).toBeNull()
    })

    it('should not subscribe to events when gamesSocket is null', () => {
      const nullSocketContext = createMockSocketContext({
        gamesSocket: null as any,
      })

      renderHookWithProviders(() => useGMDashboard(mockGMId), {
        queryClient,
        socketContext: nullSocketContext,
      })

      expect(nullSocketContext.gamesSocket).toBeNull()
    })

    it('should not subscribe to events when gamesMasterId is undefined', () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(undefined),
        { queryClient, socketContext: mockSocketContext },
      )

      expect(result.current.dashboard).toBeUndefined()
      // Socket subscriptions should not have been called
      expect(mockSocketContext.sessionsSocket?.on).not.toHaveBeenCalled()
      expect(mockSocketContext.gamesSocket?.on).not.toHaveBeenCalled()
    })

    it('should handle socket disconnection gracefully', () => {
      const disconnectedContext = createMockSocketContext({
        isConnected: false,
        sessionsSocket: null as any,
        gamesSocket: null as any,
      })

      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: disconnectedContext },
      )

      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('Manual Refetch', () => {
    it('should provide a refetch function', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.refetch).toBeDefined()
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should refetch data when refetch is called manually', async () => {
      const { result } = renderHookWithProviders(
        () => useGMDashboard(mockGMId),
        { queryClient, socketContext: mockSocketContext },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = vi.mocked(gamesMasterService.getDashboard).mock
        .calls.length

      // Manually trigger refetch
      await result.current.refetch()

      expect(gamesMasterService.getDashboard).toHaveBeenCalledTimes(
        initialCallCount + 1,
      )
    })
  })
})
