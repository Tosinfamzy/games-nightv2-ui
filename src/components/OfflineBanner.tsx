import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useSocketContext } from '../lib/socket/socket-context'

/**
 * Banner displayed when the app is offline or WebSocket disconnected
 * Shows specific disconnection reason and reconnect button
 */
export function OfflineBanner() {
  const { isOffline, networkOnline, socketsStatus } = useOnlineStatus()
  const { reconnect } = useSocketContext()

  if (!isOffline) return null

  const getOfflineReason = () => {
    if (!networkOnline) {
      return 'No internet connection'
    }
    if (!socketsStatus.allConnected) {
      const disconnected = []
      if (!socketsStatus.sessionsConnected) disconnected.push('sessions')
      if (!socketsStatus.gamesConnected) disconnected.push('games')
      if (!socketsStatus.chatConnected) disconnected.push('chat')
      return `Disconnected from ${disconnected.join(', ')}`
    }
    return 'Connection lost'
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">{getOfflineReason()}</span>
          {networkOnline && (
            <span className="text-sm opacity-90">
              - Reconnecting automatically...
            </span>
          )}
        </div>
        {networkOnline && (
          <button
            onClick={reconnect}
            className="px-3 py-1 bg-white text-yellow-700 rounded hover:bg-yellow-50 transition-colors text-sm font-medium"
          >
            Reconnect Now
          </button>
        )}
      </div>
    </div>
  )
}
