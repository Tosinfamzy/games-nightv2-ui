import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { debugLog } from '../debug-log'
import { showToast } from '../toast'
import { useNotifications } from '../../hooks/useNotifications'
import { sessionKeys } from '../api/hooks/use-session'
import { inviteKeys } from '../api/hooks/use-invite'
import { useSocketContext } from './socket-context'

/**
 * Hook to connect to a session room and listen for real-time updates
 */
export const useSessionSocket = (sessionId: string | undefined) => {
  // Gate on the /sessions namespace's own connection flag explicitly.
  const { sessionsSocket, sessionsConnected: isConnected } = useSocketContext()
  const queryClient = useQueryClient()
  const hasJoinedRef = useRef(false)
  const {
    notifyPlayerJoined,
    notifyPlayerLeft,
    notifyPlayerReady,
    notifySessionReady,
    notifyTeamsCreated,
  } = useNotifications()

  // Join session room
  useEffect(() => {
    if (!sessionsSocket || !sessionId || !isConnected || hasJoinedRef.current) {
      return
    }

    debugLog(`Joining session room: ${sessionId}`)
    sessionsSocket.emit('join-session', sessionId)
    hasJoinedRef.current = true

    return () => {
      if (sessionsSocket && sessionId) {
        debugLog(`Leaving session room: ${sessionId}`)
        sessionsSocket.emit('leave-session', sessionId)
        hasJoinedRef.current = false
      }
    }
  }, [sessionsSocket, sessionId, isConnected])

  // Listen for player joined
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handlePlayerJoined = (data: any) => {
      try {
        debugLog('Player joined:', data)

        if (!data?.playerId && !data?.player?.id) {
          console.warn(
            'Player joined event missing playerId, but still refreshing data:',
            data,
          )
        }

        // Always invalidate queries to refresh the player list
        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
        queryClient.invalidateQueries({
          queryKey: ['session-readiness', sessionId],
        })
        queryClient.invalidateQueries({
          queryKey: sessionKeys.detail(sessionId),
        })

        // Notify about player joining
        if (data?.player?.name) {
          notifyPlayerJoined(data.player.name)
        }
      } catch (error) {
        console.error('Error handling player joined event:', error)
        showToast.error('Failed to update player list. Please refresh.')
      }
    }

    sessionsSocket.on('session:player-joined', handlePlayerJoined)

    return () => {
      sessionsSocket.off('session:player-joined', handlePlayerJoined)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for guest-list / RSVP changes -> refresh the Guests tab live
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handleInvitesUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: inviteKeys.session(sessionId),
      })
      queryClient.invalidateQueries({
        queryKey: inviteKeys.summary(sessionId),
      })
    }

    sessionsSocket.on('session:invites-updated', handleInvitesUpdated)

    return () => {
      sessionsSocket.off('session:invites-updated', handleInvitesUpdated)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for player left
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handlePlayerLeft = (data: any) => {
      try {
        debugLog('Player left:', data)

        if (!data?.playerId) {
          throw new Error('Invalid player left event: missing playerId')
        }

        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
        queryClient.invalidateQueries({
          queryKey: ['session-readiness', sessionId],
        })
        queryClient.invalidateQueries({
          queryKey: sessionKeys.detail(sessionId),
        })

        // Notify about player leaving
        if (data?.player?.name) {
          notifyPlayerLeft(data.player.name)
        }
      } catch (error) {
        console.error('Error handling player left event:', error)
        showToast.error('Failed to update player list. Please refresh.')
      }
    }

    sessionsSocket.on('session:player-left', handlePlayerLeft)

    return () => {
      sessionsSocket.off('session:player-left', handlePlayerLeft)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for player readiness changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handlePlayerReadyChanged = (data: any) => {
      try {
        debugLog('Player readiness changed:', data)

        if (!data?.playerId) {
          throw new Error('Invalid player ready event: missing playerId')
        }

        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
        queryClient.invalidateQueries({
          queryKey: ['session-readiness', sessionId],
        })
        queryClient.invalidateQueries({
          queryKey: ['session-can-start', sessionId],
        })

        // Notify when player becomes ready
        if (data?.ready && data?.player?.name) {
          notifyPlayerReady(data.player.name)
        }
      } catch (error) {
        console.error('Error handling player readiness change:', error)
        showToast.error('Failed to update player status. Please refresh.')
      }
    }

    sessionsSocket.on('session:player-ready-changed', handlePlayerReadyChanged)

    return () => {
      sessionsSocket.off(
        'session:player-ready-changed',
        handlePlayerReadyChanged,
      )
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for session readiness changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handleReadinessChanged = (data: any) => {
      try {
        debugLog('Session readiness changed:', data)

        if (!data?.readiness) {
          throw new Error('Invalid readiness event: missing readiness data')
        }

        queryClient.setQueryData(
          ['session-readiness', sessionId],
          data.readiness,
        )

        // Notify when all players are ready
        if (data.readiness?.allReady) {
          notifySessionReady()
        }
      } catch (error) {
        console.error('Error handling readiness change:', error)
        showToast.error('Failed to update session readiness. Please refresh.')
      }
    }

    sessionsSocket.on('session:readiness-changed', handleReadinessChanged)

    return () => {
      sessionsSocket.off('session:readiness-changed', handleReadinessChanged)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for session status changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handleStatusChanged = (data: any) => {
      try {
        debugLog('Session status changed:', data)

        if (!data?.status) {
          throw new Error('Invalid status change event: missing status')
        }

        queryClient.invalidateQueries({
          queryKey: sessionKeys.detail(sessionId),
        })
      } catch (error) {
        console.error('Error handling status change:', error)
        showToast.error('Failed to update session status. Please refresh.')
      }
    }

    sessionsSocket.on('session:status-changed', handleStatusChanged)

    return () => {
      sessionsSocket.off('session:status-changed', handleStatusChanged)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for team events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handleTeamCreated = (data: any) => {
      try {
        debugLog('Team created:', data)
        queryClient.invalidateQueries({
          queryKey: sessionKeys.teams(sessionId),
        })

        // Notify about team creation - we'll track this in a ref to only notify once
        if (data?.teams) {
          notifyTeamsCreated(data.teams.length)
        }
      } catch (error) {
        console.error('Error handling team created event:', error)
        showToast.error('Failed to update teams. Please refresh.')
      }
    }

    const handleTeamUpdated = (data: any) => {
      try {
        debugLog('Team updated:', data)
        queryClient.invalidateQueries({
          queryKey: sessionKeys.teams(sessionId),
        })
      } catch (error) {
        console.error('Error handling team updated event:', error)
        showToast.error('Failed to update teams. Please refresh.')
      }
    }

    const handleTeamDeleted = (data: any) => {
      try {
        debugLog('Team deleted:', data)
        queryClient.invalidateQueries({
          queryKey: sessionKeys.teams(sessionId),
        })
      } catch (error) {
        console.error('Error handling team deleted event:', error)
        showToast.error('Failed to update teams. Please refresh.')
      }
    }

    const handlePlayerAssigned = (data: any) => {
      try {
        debugLog('Player assigned to team:', data)
        queryClient.invalidateQueries({
          queryKey: sessionKeys.teams(sessionId),
        })
        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
      } catch (error) {
        console.error('Error handling player assignment:', error)
        showToast.error('Failed to update team assignments. Please refresh.')
      }
    }

    sessionsSocket.on('session:team-created', handleTeamCreated)
    sessionsSocket.on('session:team-updated', handleTeamUpdated)
    sessionsSocket.on('session:team-deleted', handleTeamDeleted)
    sessionsSocket.on('session:player-assigned-to-team', handlePlayerAssigned)

    return () => {
      sessionsSocket.off('session:team-created', handleTeamCreated)
      sessionsSocket.off('session:team-updated', handleTeamUpdated)
      sessionsSocket.off('session:team-deleted', handleTeamDeleted)
      sessionsSocket.off(
        'session:player-assigned-to-team',
        handlePlayerAssigned,
      )
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for can-start changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handleCanStartChanged = (data: any) => {
      try {
        debugLog('Can start changed:', data)
        queryClient.invalidateQueries({
          queryKey: ['session-can-start', sessionId],
        })
      } catch (error) {
        console.error('Error handling can-start change:', error)
        showToast.error('Failed to update session status. Please refresh.')
      }
    }

    sessionsSocket.on('session:can-start-changed', handleCanStartChanged)

    return () => {
      sessionsSocket.off('session:can-start-changed', handleCanStartChanged)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for player online events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handlePlayerOnline = (data: any) => {
      try {
        debugLog('Player online:', data)

        if (!data?.playerId) {
          throw new Error('Invalid player online event: missing playerId')
        }

        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
      } catch (error) {
        console.error('Error handling player online event:', error)
        // Silent failure for online status - not critical
      }
    }

    sessionsSocket.on('session:player-online', handlePlayerOnline)

    return () => {
      sessionsSocket.off('session:player-online', handlePlayerOnline)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for player offline events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return

    const handlePlayerOffline = (data: any) => {
      try {
        debugLog('Player offline:', data)

        if (!data?.playerId) {
          throw new Error('Invalid player offline event: missing playerId')
        }

        queryClient.invalidateQueries({
          queryKey: sessionKeys.players(sessionId),
        })
      } catch (error) {
        console.error('Error handling player offline event:', error)
        // Silent failure for offline status - not critical
      }
    }

    sessionsSocket.on('session:player-offline', handlePlayerOffline)

    return () => {
      sessionsSocket.off('session:player-offline', handlePlayerOffline)
    }
  }, [sessionsSocket, sessionId, queryClient])

  // Listen for server-pushed session errors
  useEffect(() => {
    if (!sessionsSocket) return

    const handleError = (data: { error: string; code: string }) => {
      console.error('Session error from server:', data)

      const errorMessage = data?.error || 'A session error occurred'

      if (
        data?.code === 'UNAUTHORIZED' ||
        data?.code === 'UnauthorizedException'
      ) {
        showToast.error('Session access denied. Please rejoin.')
      } else if (
        data?.code === 'NOT_FOUND' ||
        data?.code === 'NotFoundException'
      ) {
        showToast.error('Session not found. It may have ended.')
      } else if (
        data?.code === 'FORBIDDEN' ||
        data?.code === 'ForbiddenException'
      ) {
        showToast.error(`Access denied: ${errorMessage}`)
      } else {
        showToast.error(`Session error: ${errorMessage}`)
      }
    }

    sessionsSocket.on('session:error', handleError)
    sessionsSocket.on('error', handleError)

    return () => {
      sessionsSocket.off('session:error', handleError)
      sessionsSocket.off('error', handleError)
    }
  }, [sessionsSocket])

  return {
    isConnected,
    socket: sessionsSocket,
  }
}
