import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { debugLog } from '../lib/debug-log'
import { useSocketContext } from '../lib/socket/socket-context'
import { gameService } from '../lib/api/services/game.service'
import { showToast, toastHelpers } from '../lib/toast'
import type { UUID } from '../lib/api/types'

/**
 * Hook to manage game control operations (start, pause, resume, complete, rounds, turns)
 * with real-time WebSocket updates
 *
 * @param gameId - The game ID to control
 * @returns Game control actions and state
 */
export const useGameControl = (gameId: UUID | undefined) => {
  const queryClient = useQueryClient()
  const { gamesSocket } = useSocketContext()

  // Fetch current game state
  const {
    data: game,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.getById(gameId)
    },
    enabled: !!gameId,
    refetchInterval: 10000, // Fallback refresh every 10s
  })

  // Game lifecycle mutations
  const startGameMutation = useMutation({
    mutationFn: (teamIds?: Array<string>) => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.start(gameId, teamIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Game started successfully')
    },
    onError: (error) => {
      toastHelpers.operationError('start game', error)
    },
  })

  const pauseGameMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.pause(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Game paused')
    },
    onError: (error) => {
      toastHelpers.operationError('pause game', error)
    },
  })

  const resumeGameMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.resume(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Game resumed')
    },
    onError: (error) => {
      toastHelpers.operationError('resume game', error)
    },
  })

  const completeGameMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.complete(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Game completed!')
    },
    onError: (error) => {
      toastHelpers.operationError('complete game', error)
    },
  })

  const cancelGameMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.cancel(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.info('Game cancelled')
    },
    onError: (error) => {
      toastHelpers.operationError('cancel game', error)
    },
  })

  // Round management mutations
  const startFirstRoundMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.startFirstRound(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Round 1 started!')
    },
    onError: (error) => {
      toastHelpers.operationError('start first round', error)
    },
  })

  const nextRoundMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.nextRound(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Next round started!')
    },
    onError: (error) => {
      toastHelpers.operationError('advance round', error)
    },
  })

  const endRoundMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.endRound(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.info('Round ended')
    },
    onError: (error) => {
      toastHelpers.operationError('end round', error)
    },
  })

  // Turn management mutation
  const nextTurnMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return gameService.nextTurn(gameId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Next turn!')
    },
    onError: (error) => {
      toastHelpers.operationError('advance turn', error)
    },
  })

  // Listen to game events for real-time updates
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleGameEvent = (data: any) => {
      debugLog('Game event received:', data)
      // Invalidate and refetch game data
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
    }

    // Subscribe to all relevant game events
    gamesSocket.on('game:started', handleGameEvent)
    gamesSocket.on('game:paused', handleGameEvent)
    gamesSocket.on('game:resumed', handleGameEvent)
    gamesSocket.on('game:completed', handleGameEvent)
    gamesSocket.on('game:cancelled', handleGameEvent)
    gamesSocket.on('game:round-started', handleGameEvent)
    gamesSocket.on('game:round-ended', handleGameEvent)
    gamesSocket.on('game:turn-advanced', handleGameEvent)

    return () => {
      gamesSocket.off('game:started', handleGameEvent)
      gamesSocket.off('game:paused', handleGameEvent)
      gamesSocket.off('game:resumed', handleGameEvent)
      gamesSocket.off('game:completed', handleGameEvent)
      gamesSocket.off('game:cancelled', handleGameEvent)
      gamesSocket.off('game:round-started', handleGameEvent)
      gamesSocket.off('game:round-ended', handleGameEvent)
      gamesSocket.off('game:turn-advanced', handleGameEvent)
    }
  }, [gamesSocket, gameId, queryClient])

  return {
    game,
    isLoading,
    error,
    refetch,
    // Game lifecycle actions
    startGame: startGameMutation.mutate,
    pauseGame: pauseGameMutation.mutate,
    resumeGame: resumeGameMutation.mutate,
    completeGame: completeGameMutation.mutate,
    cancelGame: cancelGameMutation.mutate,
    // Round management actions
    startFirstRound: startFirstRoundMutation.mutate,
    nextRound: nextRoundMutation.mutate,
    endRound: endRoundMutation.mutate,
    // Turn management actions
    nextTurn: nextTurnMutation.mutate,
    // Mutation states
    isStarting: startGameMutation.isPending,
    isPausing: pauseGameMutation.isPending,
    isResuming: resumeGameMutation.isPending,
    isCompleting: completeGameMutation.isPending,
    isCancelling: cancelGameMutation.isPending,
    isStartingRound: startFirstRoundMutation.isPending,
    isAdvancingRound: nextRoundMutation.isPending,
    isEndingRound: endRoundMutation.isPending,
    isAdvancingTurn: nextTurnMutation.isPending,
  }
}
