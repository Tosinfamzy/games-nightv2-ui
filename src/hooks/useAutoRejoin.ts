import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../lib/api/services'
import { HOST_TOKEN_MARKER, usePlayer } from '../contexts/PlayerContext'
import { showToast } from '../lib/toast'
import { APIError } from '../lib/api/client'
import { isAuthError } from '../lib/errors/error-codes'

/**
 * Automatic rejoin hook
 * Checks if user has a player token but no player data (orphaned token)
 * Attempts to automatically rejoin the session
 */
export function useAutoRejoin() {
  const navigate = useNavigate()
  const { player, playerToken, setPlayer, clearPlayer } = usePlayer()
  const attemptedRef = useRef(false)

  const rejoinMutation = useMutation({
    mutationFn: (token: string) => sessionService.rejoinSession(token),
    // A transient network blip or 5xx must not cost the host their session.
    // Retry those a couple of times; never retry a real auth rejection or a
    // 4xx (those won't succeed on a retry).
    retry: (failureCount, error) => {
      if (isAuthError(error)) return false
      if (
        error instanceof APIError &&
        error.status >= 400 &&
        error.status < 500
      )
        return false
      return failureCount < 2
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    onSuccess: (response) => {
      // Create player object from response
      const playerData = {
        id: response.playerId,
        name: response.playerName,
        session: response.session,
        status: 'joined' as const,
      }

      // Save player and fresh token to context
      setPlayer(playerData as any, response.playerToken)

      // Show success notification
      showToast.success(`Welcome back, ${response.playerName}!`)

      // Navigate to session (only if not already on a session page)
      if (!window.location.pathname.includes('/sessions/')) {
        navigate({ to: '/sessions/$id', params: { id: response.session.id } })
      }
    },
    onError: (error: unknown) => {
      console.warn('Auto-rejoin failed:', error)

      // Only wipe the stored credentials on a genuine auth rejection (expired
      // or invalid token). A network failure or 5xx must NOT clear the token —
      // that would lock the host out of their own session with no recovery.
      // Keep it so the host can retry (or a later reconnect can re-attempt).
      if (isAuthError(error)) {
        clearPlayer()
      }

      // No error toast for auto-rejoin: the user can manually rejoin if needed.
    },
  })

  useEffect(() => {
    // Only attempt once per app session
    if (attemptedRef.current) {
      return
    }

    // A host-connection token (minted for a Clerk-only host to open sockets) has
    // no player record to rejoin; useHostRealtimeToken owns it. Attempting a
    // rejoin here would, on failure, clearPlayer() and wipe the host's realtime
    // token — so skip it.
    if (localStorage.getItem(HOST_TOKEN_MARKER) === '1') {
      return
    }

    // Check if we have an orphaned token (token but no player)
    if (playerToken && !player) {
      attemptedRef.current = true

      // Small delay to let the app finish initializing
      const timer = setTimeout(() => {
        rejoinMutation.mutate(playerToken)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [playerToken, player])

  return {
    isRejoining: rejoinMutation.isPending,
    rejoinError: rejoinMutation.error,
  }
}
