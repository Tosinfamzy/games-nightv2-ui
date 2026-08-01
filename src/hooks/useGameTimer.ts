import { useEffect, useRef, useState } from 'react'
import { debugLog } from '../lib/debug-log'
import { useSocketContext } from '../lib/socket/socket-context'
import { gameService } from '../lib/api/services/game.service'
import type {
  TimerExpiredEvent,
  TimerTickEvent,
  TurnAdvancedEvent,
  TurnStartedEvent,
} from '../lib/api/types'

/**
 * Hook to manage game timer state from WebSocket events
 */
export const useGameTimer = (gameId: string | undefined) => {
  const { gamesSocket, isConnected, gamesConnected } = useSocketContext()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [turnTimeLimit, setTurnTimeLimit] = useState<number | null>(null)
  const [turnEndsAt, setTurnEndsAt] = useState<string | null>(null)
  const [currentTeamName, setCurrentTeamName] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)
  const [autoAdvanced, setAutoAdvanced] = useState(false)

  // Seed the timer from REST on mount so a refresh mid-turn shows the countdown
  // immediately instead of a blank timer until the next socket tick. Functional
  // updates only fill values a socket event hasn't already set (avoids clobber).
  useEffect(() => {
    if (!gameId) return
    let cancelled = false
    gameService
      .getTimer(gameId)
      .then((t) => {
        if (cancelled || !t || !t.turnTimeLimit || !t.turnStartedAt) return
        setTurnTimeLimit((prev) => prev ?? t.turnTimeLimit)
        setTimeRemaining((prev) => (prev === null ? t.remainingSeconds : prev))
        setCurrentTeamName((prev) => prev || t.currentTurnTeamName || '')
        setIsExpired((prev) => prev || Boolean(t.isExpired))
        setTurnEndsAt(
          (prev) =>
            prev ??
            new Date(
              new Date(t.turnStartedAt as string).getTime() +
                (t.turnTimeLimit as number) * 1000,
            ).toISOString(),
        )
      })
      .catch(() => {
        /* timer seed is best-effort; socket events still drive updates */
      })
    return () => {
      cancelled = true
    }
  }, [gameId])

  // Re-seed authoritatively when the /games socket reconnects. Ticks, turn
  // changes, and expiry fired during a drop are lost, leaving the local timer
  // stale (wrong remaining time / wrong active entrant). Unlike the mount seed,
  // this OVERWRITES — on reconnect the server's timer is the source of truth.
  const wasConnectedRef = useRef(false)
  useEffect(() => {
    if (!gameId) return
    if (!gamesConnected) {
      wasConnectedRef.current = false
      return
    }
    if (wasConnectedRef.current) return
    wasConnectedRef.current = true
    let cancelled = false
    gameService
      .getTimer(gameId)
      .then((t) => {
        if (cancelled) return
        if (!t || !t.turnTimeLimit || !t.turnStartedAt) {
          // No active timer server-side — clear any stale local countdown.
          setTurnTimeLimit(null)
          setTimeRemaining(null)
          setTurnEndsAt(null)
          setIsExpired(false)
          return
        }
        setTurnTimeLimit(t.turnTimeLimit)
        setTimeRemaining(t.remainingSeconds)
        setCurrentTeamName(t.currentTurnTeamName || '')
        setIsExpired(Boolean(t.isExpired))
        setTurnEndsAt(
          new Date(
            new Date(t.turnStartedAt as string).getTime() +
              (t.turnTimeLimit as number) * 1000,
          ).toISOString(),
        )
      })
      .catch(() => {
        /* best-effort resync; socket events still drive updates */
      })
    return () => {
      cancelled = true
    }
  }, [gamesConnected, gameId])

  // Listen for timer tick events
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTimerTick = (data: TimerTickEvent) => {
      if (data.gameId === gameId) {
        setTimeRemaining(data.timeRemaining)
        setIsExpired(false)
      }
    }

    gamesSocket.on('game:timer-tick', handleTimerTick)

    return () => {
      gamesSocket.off('game:timer-tick', handleTimerTick)
    }
  }, [gamesSocket, gameId])

  // Listen for turn started events
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTurnStarted = (data: TurnStartedEvent) => {
      if (data.gameId === gameId) {
        debugLog('Turn started:', data)
        setTurnTimeLimit(data.turnTimeLimit)
        setTurnEndsAt(data.turnEndsAt)
        setCurrentTeamName(data.teamName)
        setTimeRemaining(data.turnTimeLimit)
        setIsExpired(false)
        setAutoAdvanced(false)
      }
    }

    gamesSocket.on('game:turn-started', handleTurnStarted)

    return () => {
      gamesSocket.off('game:turn-started', handleTurnStarted)
    }
  }, [gamesSocket, gameId])

  // Listen for turn advanced events
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTurnAdvanced = (data: TurnAdvancedEvent) => {
      if (data.gameId === gameId) {
        debugLog('Turn advanced:', data)
        setTurnTimeLimit(data.turnTimeLimit)
        setTurnEndsAt(data.turnEndsAt)
        setCurrentTeamName(data.nextTeamName)
        setTimeRemaining(data.turnTimeLimit)
        setAutoAdvanced(data.autoAdvanced)
        setIsExpired(false)
      }
    }

    gamesSocket.on('game:turn-advanced', handleTurnAdvanced)

    return () => {
      gamesSocket.off('game:turn-advanced', handleTurnAdvanced)
    }
  }, [gamesSocket, gameId])

  // Listen for timer expired events
  useEffect(() => {
    if (!gamesSocket || !gameId) return

    const handleTimerExpired = (data: TimerExpiredEvent) => {
      if (data.gameId === gameId) {
        debugLog('Timer expired:', data)
        setTimeRemaining(0)
        setIsExpired(true)
      }
    }

    gamesSocket.on('game:timer-expired', handleTimerExpired)

    return () => {
      gamesSocket.off('game:timer-expired', handleTimerExpired)
    }
  }, [gamesSocket, gameId])

  // Format time for display (MM:SS)
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Check if timer is in warning state (< 10 seconds)
  const isWarning =
    timeRemaining !== null && timeRemaining <= 10 && timeRemaining > 0

  return {
    isConnected,
    timeRemaining,
    turnTimeLimit,
    turnEndsAt,
    currentTeamName,
    isExpired,
    autoAdvanced,
    isWarning,
    formattedTime: formatTime(timeRemaining),
    hasTimer: turnTimeLimit !== null && turnTimeLimit > 0,
  }
}
