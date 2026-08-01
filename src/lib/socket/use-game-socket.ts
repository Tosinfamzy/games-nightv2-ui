import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { debugLog } from '../debug-log'
import { showToast } from '../toast'
import { useNotifications } from '../../hooks/useNotifications'
import { useSocketContext } from './socket-context'

/**
 * Hook to connect to a game room and listen for real-time updates
 */
export const useGameSocket = (
  gameId: string | undefined,
  options?: { currentTeamId?: string },
) => {
  // Gate on the /games namespace's own connection, not the top-level flag (which
  // only tracks /sessions) — a partial outage shouldn't cross-wire namespaces.
  const { gamesSocket, gamesConnected: isConnected } = useSocketContext()
  const queryClient = useQueryClient()
  const hasJoinedRef = useRef(false)
  const currentTeamId = options?.currentTeamId
  const {
    notifyGameStarted,
    notifyRoundStarted,
    notifyYourTurn,
    notifyTeamTurn,
    notifyGameCompleted,
  } = useNotifications()

  // Join game room
  useEffect(() => {
    if (!gamesSocket || !gameId || !isConnected || hasJoinedRef.current) {
      return
    }

    debugLog(`Joining game room: ${gameId}`)
    gamesSocket.emit('join-game', gameId)
    hasJoinedRef.current = true

    return () => {
      if (gamesSocket && gameId) {
        debugLog(`Leaving game room: ${gameId}`)
        gamesSocket.emit('leave-game', gameId)
        hasJoinedRef.current = false
      }
    }
  }, [gamesSocket, gameId, isConnected])

  // Listen for score submitted
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleScoreSubmitted = (data: any) => {
      try {
        debugLog('Score submitted:', data)

        if (!data?.scoreId && !data?.teamId) {
          throw new Error(
            'Invalid score submitted event: missing required data',
          )
        }

        queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
        queryClient.invalidateQueries({ queryKey: ['leaderboard', gameId] })
      } catch (error) {
        console.error('Error handling score submitted event:', error)
        showToast.error('Failed to update scores. Please refresh.')
      }
    }

    gamesSocket.on('game:score-submitted', handleScoreSubmitted)

    return () => {
      gamesSocket.off('game:score-submitted', handleScoreSubmitted)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for score updated
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleScoreUpdated = (data: any) => {
      try {
        debugLog('Score updated:', data)

        if (!data?.scoreId) {
          throw new Error('Invalid score updated event: missing scoreId')
        }

        queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
        queryClient.invalidateQueries({ queryKey: ['leaderboard', gameId] })
      } catch (error) {
        console.error('Error handling score updated event:', error)
        showToast.error('Failed to update scores. Please refresh.')
      }
    }

    gamesSocket.on('game:score-updated', handleScoreUpdated)

    return () => {
      gamesSocket.off('game:score-updated', handleScoreUpdated)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for game started
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleGameStarted = (data: any) => {
      try {
        debugLog('Game started:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })

        // Notify about game starting
        if (data?.game?.name) {
          notifyGameStarted(data.game.name)
        }
      } catch (error) {
        console.error('Error handling game started event:', error)
        showToast.error('Failed to update game status. Please refresh.')
      }
    }

    gamesSocket.on('game:started', handleGameStarted)

    return () => {
      gamesSocket.off('game:started', handleGameStarted)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for game paused
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleGamePaused = (data: any) => {
      try {
        debugLog('Game paused:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      } catch (error) {
        console.error('Error handling game paused event:', error)
        showToast.error('Failed to update game status. Please refresh.')
      }
    }

    gamesSocket.on('game:paused', handleGamePaused)

    return () => {
      gamesSocket.off('game:paused', handleGamePaused)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for game resumed
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleGameResumed = (data: any) => {
      try {
        debugLog('Game resumed:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      } catch (error) {
        console.error('Error handling game resumed event:', error)
        showToast.error('Failed to update game status. Please refresh.')
      }
    }

    gamesSocket.on('game:resumed', handleGameResumed)

    return () => {
      gamesSocket.off('game:resumed', handleGameResumed)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for game completed
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleGameCompleted = (data: any) => {
      try {
        debugLog('Game completed:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })

        // Notify about game completion
        if (data?.game?.name) {
          notifyGameCompleted(data.game.name, data?.winner?.name)
        }
      } catch (error) {
        console.error('Error handling game completed event:', error)
        showToast.error('Failed to update game status. Please refresh.')
      }
    }

    gamesSocket.on('game:completed', handleGameCompleted)

    return () => {
      gamesSocket.off('game:completed', handleGameCompleted)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for round started
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleRoundStarted = (data: any) => {
      try {
        debugLog('Round started:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })

        // Notify about new round
        if (data?.roundNumber) {
          notifyRoundStarted(data.roundNumber)
        }
      } catch (error) {
        console.error('Error handling round started event:', error)
        showToast.error('Failed to update round status. Please refresh.')
      }
    }

    gamesSocket.on('game:round-started', handleRoundStarted)

    return () => {
      gamesSocket.off('game:round-started', handleRoundStarted)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for round ended
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleRoundEnded = (data: any) => {
      try {
        debugLog('Round ended:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      } catch (error) {
        console.error('Error handling round ended event:', error)
        showToast.error('Failed to update round status. Please refresh.')
      }
    }

    gamesSocket.on('game:round-ended', handleRoundEnded)

    return () => {
      gamesSocket.off('game:round-ended', handleRoundEnded)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for turn started events (timer)
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTurnStarted = (data: any) => {
      try {
        debugLog('Turn started:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })

        // BE payload is { teamId, teamName } (not { team: { name } }).
        const teamName: string | undefined = data?.teamName
        const teamId: string | undefined = data?.teamId
        if (!teamName) return

        // Targeted: only the players on the active team get the prominent
        // "it's your turn" alert; everyone else gets a subtle "now playing".
        // On shared screens (no currentTeamId, e.g. the TV view) we stay silent
        // since the turn is already shown on-screen.
        if (currentTeamId) {
          if (teamId === currentTeamId) {
            notifyYourTurn(teamName)
          } else {
            notifyTeamTurn(teamName)
          }
        }
      } catch (error) {
        console.error('Error handling turn started event:', error)
        // Silent failure for turn events - not critical
      }
    }

    gamesSocket.on('game:turn-started', handleTurnStarted)

    return () => {
      gamesSocket.off('game:turn-started', handleTurnStarted)
    }
  }, [
    gamesSocket,
    gameId,
    queryClient,
    currentTeamId,
    notifyYourTurn,
    notifyTeamTurn,
  ])

  // Listen for turn advanced events (timer)
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTurnAdvanced = (data: any) => {
      try {
        debugLog('Turn advanced:', data)
        queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      } catch (error) {
        console.error('Error handling turn advanced event:', error)
        // Silent failure for turn events - not critical
      }
    }

    gamesSocket.on('game:turn-advanced', handleTurnAdvanced)

    return () => {
      gamesSocket.off('game:turn-advanced', handleTurnAdvanced)
    }
  }, [gamesSocket, gameId, queryClient])

  // Listen for server-pushed game errors
  useEffect(() => {
    if (!gamesSocket) return

    const handleError = (data: { error: string; code: string }) => {
      console.error('Game error from server:', data)

      const errorMessage = data?.error || 'A game error occurred'

      if (
        data?.code === 'UNAUTHORIZED' ||
        data?.code === 'UnauthorizedException'
      ) {
        showToast.error('Game access denied. Please rejoin the session.')
      } else if (
        data?.code === 'NOT_FOUND' ||
        data?.code === 'NotFoundException'
      ) {
        showToast.error('Game not found. It may have ended.')
      } else if (
        data?.code === 'FORBIDDEN' ||
        data?.code === 'ForbiddenException'
      ) {
        showToast.error(`Access denied: ${errorMessage}`)
      } else if (data?.code === 'INVALID_STATE') {
        showToast.error(`Cannot perform action: ${errorMessage}`)
      } else {
        showToast.error(`Game error: ${errorMessage}`)
      }
    }

    gamesSocket.on('game:error', handleError)
    gamesSocket.on('error', handleError)

    return () => {
      gamesSocket.off('game:error', handleError)
      gamesSocket.off('error', handleError)
    }
  }, [gamesSocket])

  // Backfill on (re)connect — same rationale as the sessions hook. The per-event
  // handlers only fire while connected, so a score, turn advance, or game
  // completion broadcast during a phone-lock/wifi drop is missed and the board
  // would sit stale (a finished game never self-heals — no further event fires).
  // Re-invalidate game/scores/leaderboard on the disconnect→reconnect edge.
  const wasConnectedRef = useRef(false)
  useEffect(() => {
    if (isConnected && !wasConnectedRef.current && gameId) {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      queryClient.invalidateQueries({ queryKey: ['game-scores', gameId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameId] })
    }
    wasConnectedRef.current = isConnected
  }, [isConnected, gameId, queryClient])

  return {
    isConnected,
    socket: gamesSocket,
  }
}
