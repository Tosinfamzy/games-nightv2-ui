import { useEffect, useState } from 'react'
import { useSocketContext } from '../lib/socket/socket-context'

/**
 * Hook to track online/offline status
 * Combines browser network status with WebSocket connection status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const {
    sessionsConnected,
    gamesConnected,
    chatConnected,
    shouldBeConnected,
  } = useSocketContext()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const allSocketsConnected =
    sessionsConnected && gamesConnected && chatConnected

  // Base "offline" on the primary /sessions channel, not on all three being up.
  // Requiring every namespace meant one flapping socket (e.g. /chat on a page
  // with no chat) pinned the offline banner open forever. If /sessions is
  // connected we're online enough; games/chat degrade quietly.
  const socketsOffline = shouldBeConnected && !sessionsConnected

  return {
    isOnline: isOnline && (!shouldBeConnected || sessionsConnected),
    isOffline: !isOnline || socketsOffline,
    networkOnline: isOnline,
    socketsStatus: {
      sessionsConnected,
      gamesConnected,
      chatConnected,
      allConnected: allSocketsConnected,
    },
  }
}
