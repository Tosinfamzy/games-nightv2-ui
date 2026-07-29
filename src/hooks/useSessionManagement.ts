import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  playerService,
  sessionManagementService,
  sessionService,
} from '../lib/api/services'
import { showToast } from '../lib/toast'

export function useSessionDetails(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionService.getById(sessionId),
    enabled: !!sessionId,
  })
}

export function useSessionPlayers(sessionId: string) {
  return useQuery({
    queryKey: ['players', 'session', sessionId],
    queryFn: () => playerService.getBySession(sessionId),
    enabled: !!sessionId,
  })
}

export function useSessionGames(sessionId: string) {
  return useQuery({
    queryKey: ['games', 'session', sessionId],
    queryFn: () => sessionManagementService.getSessionGames(sessionId),
    enabled: !!sessionId,
  })
}

export function useSessionTeams(sessionId: string) {
  return useQuery({
    queryKey: ['teams', 'session', sessionId],
    queryFn: () => sessionManagementService.getSessionTeams(sessionId),
    enabled: !!sessionId,
  })
}

export function useSessionReadiness(sessionId: string) {
  return useQuery({
    queryKey: ['session-readiness', sessionId],
    queryFn: () => sessionManagementService.getSessionReadiness(sessionId),
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds for readiness updates
  })
}

export function useSessionManagement(sessionId: string) {
  const queryClient = useQueryClient()

  // Session lifecycle mutations
  const startSession = useMutation({
    mutationFn: () => sessionService.start(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      showToast.success('Session started!')
    },
  })

  const completeSession = useMutation({
    mutationFn: () => sessionService.complete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      showToast.success('Session completed!')
    },
  })

  const cancelSession = useMutation({
    mutationFn: () => sessionService.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      showToast.info('Session cancelled')
    },
  })

  // Game management mutations
  const addGamesToSession = useMutation({
    mutationFn: (gameLibraryIds: Array<string>) =>
      sessionManagementService.addGamesToSession(sessionId, { gameLibraryIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['games', 'session', sessionId],
      })
      showToast.success('Games added to session')
    },
  })

  const removeGamesFromSession = useMutation({
    mutationFn: (gameId: string) =>
      sessionManagementService.removeGamesFromSession(sessionId, { gameId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['games', 'session', sessionId],
      })
      showToast.info('Game removed from session')
    },
  })

  // Team management mutations
  const createTeam = useMutation({
    mutationFn: (data: {
      name: string
      gameId?: string
      color?: string
      playerIds?: Array<string>
    }) => sessionManagementService.createTeam(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      showToast.success('Team created successfully')
    },
  })

  const assignPlayersToTeam = useMutation({
    mutationFn: ({
      teamId,
      playerIds,
    }: {
      teamId: string
      playerIds: Array<string>
    }) =>
      sessionManagementService.assignPlayersToTeam(sessionId, teamId, {
        playerIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', sessionId],
      })
      showToast.success('Players assigned to team')
    },
  })

  // Player readiness mutations
  const setPlayerReady = useMutation({
    mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
      sessionManagementService.setPlayerReady(sessionId, playerId, ready),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', sessionId],
      })
      showToast.success(
        variables.ready
          ? 'Player marked as ready'
          : 'Player marked as not ready',
      )
    },
  })

  return {
    // Lifecycle
    startSession,
    completeSession,
    cancelSession,

    // Games
    addGamesToSession,
    removeGamesFromSession,

    // Teams
    createTeam,
    assignPlayersToTeam,

    // Readiness
    setPlayerReady,
  }
}

export function useSessionStats(sessionId: string) {
  return useQuery({
    queryKey: ['session-stats', sessionId],
    queryFn: () => sessionManagementService.getSessionStats(sessionId),
    enabled: !!sessionId,
  })
}
