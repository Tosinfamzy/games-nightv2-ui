import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { teamService } from '../lib/api/services/team.service'
import * as toast from '../lib/toast'
import { useTeamManagement } from './useTeamManagement'
import type { ReactNode } from 'react'

vi.mock('../lib/api/services/team.service', () => ({
  teamService: {
    swapPlayer: vi.fn(),
    dissolveTeam: vi.fn(),
    reassignPlayer: vi.fn(),
  },
}))

vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useTeamManagement', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('dissolveTeam', () => {
    it('should successfully dissolve a team', async () => {
      const mockResponse = { message: 'Team dissolved successfully' }
      vi.mocked(teamService.dissolveTeam).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.dissolveTeam('team-1')

      await waitFor(() => {
        expect(result.current.isDissolvingTeam).toBe(false)
      })

      expect(teamService.dissolveTeam).toHaveBeenCalledWith('team-1')
      expect(toast.showToast.success).toHaveBeenCalledWith(
        'Team dissolved successfully',
      )
    })

    it('should show error toast on failure', async () => {
      const error = new Error('Failed to dissolve team')
      vi.mocked(teamService.dissolveTeam).mockRejectedValue(error)

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.dissolveTeam('team-1')

      await waitFor(() => {
        expect(result.current.isDissolvingTeam).toBe(false)
      })

      expect(toast.showToast.error).toHaveBeenCalledWith(
        'Failed to dissolve team: Failed to dissolve team',
      )
    })

    it('should invalidate teams queries on success', async () => {
      const mockResponse = { message: 'Team dissolved successfully' }
      vi.mocked(teamService.dissolveTeam).mockResolvedValue(mockResponse)

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.dissolveTeam('team-1')

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teams'] })
      })
    })
  })

  describe('reassignPlayer', () => {
    const mockTeam = {
      id: 'team-2',
      name: 'Team Beta',
      color: '#FF0000',
      position: 2,
      isActive: true,
      playerIds: ['player-1'],
      scoreIds: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    it('should successfully reassign a player', async () => {
      vi.mocked(teamService.reassignPlayer).mockResolvedValue(mockTeam)

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.reassignPlayer({
        playerId: 'player-1',
        newTeamId: 'team-2',
      })

      await waitFor(() => {
        expect(result.current.isReassigningPlayer).toBe(false)
      })

      expect(teamService.reassignPlayer).toHaveBeenCalledWith(
        'player-1',
        'team-2',
      )
      expect(toast.showToast.success).toHaveBeenCalledWith(
        'Player reassigned successfully',
      )
    })

    it('should show error toast on failure', async () => {
      const error = new Error('Player not found')
      vi.mocked(teamService.reassignPlayer).mockRejectedValue(error)

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.reassignPlayer({
        playerId: 'player-1',
        newTeamId: 'team-2',
      })

      await waitFor(() => {
        expect(result.current.isReassigningPlayer).toBe(false)
      })

      expect(toast.showToast.error).toHaveBeenCalledWith(
        'Failed to reassign player: Player not found',
      )
    })

    it('should invalidate correct queries on success', async () => {
      vi.mocked(teamService.reassignPlayer).mockResolvedValue(mockTeam)

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      result.current.reassignPlayer({
        playerId: 'player-1',
        newTeamId: 'team-2',
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teams'] })
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['team', 'team-2'],
        })
      })
    })
  })

  describe('loading states', () => {
    it('should set isDissolvingTeam to true during mutation', async () => {
      const mockResponse = { message: 'Team dissolved successfully' }
      vi.mocked(teamService.dissolveTeam).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100)
          }),
      )

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      expect(result.current.isDissolvingTeam).toBe(false)

      result.current.dissolveTeam('team-1')

      await waitFor(() => {
        expect(result.current.isDissolvingTeam).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isDissolvingTeam).toBe(false)
      })
    })

    it('should set isReassigningPlayer to true during mutation', async () => {
      const mockTeam = {
        id: 'team-2',
        name: 'Team Beta',
        color: '#FF0000',
        position: 2,
        isActive: true,
        playerIds: ['player-1'],
        scoreIds: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(teamService.reassignPlayer).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockTeam), 100)
          }),
      )

      const { result } = renderHook(() => useTeamManagement(), { wrapper })

      expect(result.current.isReassigningPlayer).toBe(false)

      result.current.reassignPlayer({
        playerId: 'player-1',
        newTeamId: 'team-2',
      })

      await waitFor(() => {
        expect(result.current.isReassigningPlayer).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isReassigningPlayer).toBe(false)
      })
    })
  })
})
