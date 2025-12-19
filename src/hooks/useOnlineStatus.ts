import { useEffect, useState } from 'react'
import { useSocketContext } from '../lib/socket/socket-context'

/**
 * Hook to track online/offline status
 * Combines browser network status with WebSocket connection status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { sessionsConnected, gamesConnected, chatConnected } =
    useSocketContext()

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

  return {
    isOnline: isOnline && allSocketsConnected,
    isOffline: !isOnline || !allSocketsConnected,
    networkOnline: isOnline,
    socketsStatus: {
      sessionsConnected,
      gamesConnected,
      chatConnected,
      allConnected: allSocketsConnected,
    },
  }
}
