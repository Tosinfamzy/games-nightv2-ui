import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessions'
import { sessionManagementService } from '../lib/api/services/session-management.service'
import { playerService } from '../lib/api/services/player.service'

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
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
    },
  })

  const completeSession = useMutation({
    mutationFn: () => sessionService.complete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
    },
  })

  const cancelSession = useMutation({
    mutationFn: () => sessionService.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
    },
  })

  // Game management mutations
  const addGamesToSession = useMutation({
    mutationFn: (gameIds: Array<string>) =>
      sessionManagementService.addGamesToSession(sessionId, { gameIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['games', 'session', sessionId],
      })
    },
  })

  const removeGamesFromSession = useMutation({
    mutationFn: (gameIds: Array<string>) =>
      sessionManagementService.removeGamesFromSession(sessionId, { gameIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['games', 'session', sessionId],
      })
    },
  })

  // Team management mutations
  const createTeam = useMutation({
    mutationFn: (data: { name: string; playerIds?: Array<string> }) =>
      sessionManagementService.createTeam({
        ...data,
        sessionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
    },
  })

  const assignPlayerToTeam = useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      sessionManagementService.assignPlayerToTeam(teamId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', sessionId],
      })
    },
  })

  // Player readiness mutations
  const setPlayerReady = useMutation({
    mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
      sessionManagementService.setPlayerReady(sessionId, playerId, ready),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', sessionId],
      })
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
    assignPlayerToTeam,

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
