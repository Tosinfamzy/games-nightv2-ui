import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { debugLog } from '../lib/debug-log'
import { useSocketContext } from '../lib/socket/socket-context'
import { scoreService } from '../lib/api/services/score.service'
import { showToast, toastHelpers } from '../lib/toast'
import type { UUID } from '../lib/api/types'
import type { SubmitGameScoreDTO } from '../lib/api/services/score.service'

/**
 * Hook to manage game scoring with real-time WebSocket updates
 *
 * @param gameId - The game ID to manage scores for
 * @returns Scoring actions and team scores
 */
export const useGameScoring = (gameId: UUID | undefined) => {
  const queryClient = useQueryClient()
  const { gamesSocket } = useSocketContext()

  // Fetch team scores for the game
  const {
    data: teamScores = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['game-scores', gameId],
    queryFn: () => {
      if (!gameId) throw new Error('Game ID is required')
      return scoreService.getGameScores(gameId)
    },
    enabled: !!gameId,
    refetchInterval: 15000, // Fallback refresh every 15s
  })

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: (data: SubmitGameScoreDTO & { gameId: UUID }) => {
      return scoreService.submitGameScore(data.gameId, {
        teamId: data.teamId,
        playerId: data.playerId,
        score: data.score,
        roundNumber: data.roundNumber,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Score submitted successfully')
    },
    onError: (error) => {
      toastHelpers.operationError('submit score', error)
    },
  })

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: ({ scoreId, points }: { scoreId: UUID; points: number }) => {
      return scoreService.update(scoreId, { points })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.success('Score updated')
    },
    onError: (error) => {
      toastHelpers.operationError('update score', error)
    },
  })

  // Delete score mutation
  const deleteScoreMutation = useMutation({
    mutationFn: (scoreId: UUID) => {
      return scoreService.delete(scoreId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      showToast.info('Score deleted')
    },
  })

  // Listen to score events for real-time updates
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleScoreEvent = (data: any) => {
      debugLog('Score event received:', data)
      // Invalidate and refetch scores
      queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
    }

    // Subscribe to the events the backend actually broadcasts. The primary one
    // is `game:score-submitted` (emitted on every score submit) — without it,
    // other clients' leaderboards only refreshed on the 15s poll.
    gamesSocket.on('game:score-submitted', handleScoreEvent)
    gamesSocket.on('game:score-updated', handleScoreEvent)

    return () => {
      gamesSocket.off('game:score-submitted', handleScoreEvent)
      gamesSocket.off('game:score-updated', handleScoreEvent)
    }
  }, [gamesSocket, gameId, queryClient])

  // Calculate leaderboard rankings
  const leaderboard = [...teamScores]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, index, arr) => ({
      ...team,
      rank: index + 1,
      isTied: index > 0 && arr[index - 1].totalPoints === team.totalPoints,
    }))

  // Get winner (only if there's a clear winner)
  const winner =
    leaderboard.length > 0 &&
    leaderboard[0].totalPoints > (leaderboard[1]?.totalPoints || 0)
      ? leaderboard[0]
      : null

  return {
    teamScores,
    leaderboard,
    winner,
    isLoading,
    error,
    refetch,
    // Score actions. Options (onSuccess/onSettled) pass through so callers can
    // react per-submission (e.g. only clear the input once the score lands).
    submitScore: (
      data: SubmitGameScoreDTO & { gameId: UUID },
      options?: Parameters<typeof submitScoreMutation.mutate>[1],
    ) => submitScoreMutation.mutate(data, options),
    updateScore: (scoreId: UUID, points: number) =>
      updateScoreMutation.mutate({ scoreId, points }),
    deleteScore: (scoreId: UUID) => deleteScoreMutation.mutate(scoreId),
    // Mutation states
    isSubmittingScore: submitScoreMutation.isPending,
    isUpdatingScore: updateScoreMutation.isPending,
    isDeletingScore: deleteScoreMutation.isPending,
  }
}
