import { useEffect, useRef } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useCurrentGm } from '../lib/api/hooks/use-current-gm'
import { useSession } from '../lib/api/hooks/use-session'
import { sessionService } from '../lib/api/services/session.service'

/**
 * A host who is signed in via Clerk but has no session-scoped player token in
 * this browser (e.g. they didn't create/join here) otherwise gets *no* real-time
 * — the sockets only connect with a player token. When that's the case, mint one
 * for the host via /sessions/:id/host-connection and hand it to PlayerContext,
 * which reconnects the sockets. Runs once per session; no-op if a token exists.
 */
export function useHostRealtimeToken(sessionId: string | undefined): void {
  const { playerToken, setPlayerToken } = usePlayer()
  const { data: currentGm } = useCurrentGm()
  const { data: session } = useSession(sessionId ?? '')
  const requestedRef = useRef(false)

  const isHost = Boolean(
    currentGm?.id && session?.host?.id && currentGm.id === session.host.id,
  )

  useEffect(() => {
    if (!sessionId || playerToken || !isHost || requestedRef.current) return
    requestedRef.current = true
    sessionService
      .getHostConnection(sessionId)
      .then((res) => setPlayerToken(res.playerToken))
      .catch(() => {
        // Best-effort — the polling fallback still keeps the UI fresh.
        requestedRef.current = false
      })
  }, [sessionId, playerToken, isHost, setPlayerToken])
}
