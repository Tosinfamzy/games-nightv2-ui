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

  // Only consider socket status if we should be connected (have player token)
  // If not in a session, don't show as "offline" just because sockets aren't connected
  const socketsOffline = shouldBeConnected && !allSocketsConnected

  return {
    isOnline: isOnline && (!shouldBeConnected || allSocketsConnected),
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
