import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { showToast } from '../toast'
import {
  ErrorSeverity,
  classifyConnectError,
  handleWebSocketError,
} from '../utils/socket-error-handler'
import { usePlayer } from '../../contexts/PlayerContext'
import type { ProcessedError } from '../utils/socket-error-handler'
import type { Socket } from 'socket.io-client'
import type { ReactNode } from 'react'

// Auto-detect API URL: use env var if set, otherwise use current host with port 3000
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Use current hostname with backend port (works for both localhost and network IPs)
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3000`
}

const API_URL = getApiUrl()

const REDIRECT_DELAY_MS = 3000

/** Surface a processed error as a toast, and redirect if it requires re-auth. */
function applyProcessedError(processed: ProcessedError): void {
  if (processed.severity === ErrorSeverity.WARNING) {
    showToast.warning(processed.message)
  } else if (processed.severity === ErrorSeverity.INFO) {
    showToast.info(processed.message)
  } else {
    showToast.error(processed.message)
  }

  if (processed.shouldRedirect && processed.redirectPath) {
    const path = processed.redirectPath
    // Delay so the user can read the toast before we navigate to rejoin.
    setTimeout(() => {
      window.location.href = path
    }, REDIRECT_DELAY_MS)
  }
}

/**
 * Attach the shared lifecycle + error handlers to a namespace socket.
 * `onConnectedChange` lets each socket update its own connection state.
 */
function attachHandlers(
  socket: Socket,
  label: string,
  onConnectedChange: (connected: boolean) => void,
): void {
  socket.on('connect', () => {
    onConnectedChange(true)
  })

  socket.on('disconnect', () => {
    onConnectedChange(false)
  })

  // Transport/handshake failures (no guaranteed structured code).
  socket.on('connect_error', (error: Error) => {
    console.error(`${label} socket connect_error:`, error)
    applyProcessedError(classifyConnectError(error, label))
  })

  // Server-pushed runtime errors from the global exception filter.
  socket.on('exception', (payload: unknown) => {
    console.error(`${label} socket exception:`, payload)
    applyProcessedError(handleWebSocketError(payload, label))
  })

  socket.on('reconnect_failed', () => {
    showToast.error(
      `Unable to reconnect to ${label}. Please refresh the page.`,
      10000,
    )
  })
}

const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.1,
}

export interface SocketContextValue {
  sessionsSocket: Socket | null
  gamesSocket: Socket | null
  chatSocket: Socket | null
  isConnected: boolean
  sessionsConnected: boolean
  gamesConnected: boolean
  chatConnected: boolean
  shouldBeConnected: boolean // Whether we expect sockets to be connected (have player token)
  reconnect: () => void
}

export const SocketContext = createContext<SocketContextValue>({
  sessionsSocket: null,
  gamesSocket: null,
  chatSocket: null,
  isConnected: false,
  sessionsConnected: false,
  gamesConnected: false,
  chatConnected: false,
  shouldBeConnected: false,
  reconnect: () => {},
})

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { playerToken } = usePlayer()
  const [sessionsSocket, setSessionsSocket] = useState<Socket | null>(null)
  const [gamesSocket, setGamesSocket] = useState<Socket | null>(null)
  const [chatSocket, setChatSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionsConnected, setSessionsConnected] = useState(false)
  const [gamesConnected, setGamesConnected] = useState(false)
  const [chatConnected, setChatConnected] = useState(false)

  useEffect(() => {
    // Only connect if we have a player token
    if (!playerToken) {
      return
    }

    const auth = { playerToken }
    const sessionSocket = io(`${API_URL}/sessions`, { ...SOCKET_OPTIONS, auth })
    const gameSocket = io(`${API_URL}/games`, { ...SOCKET_OPTIONS, auth })
    const chatSocket = io(`${API_URL}/chat`, { ...SOCKET_OPTIONS, auth })

    // Sessions drives the top-level `isConnected` flag as well.
    attachHandlers(sessionSocket, 'sessions', (connected) => {
      setSessionsConnected(connected)
      setIsConnected(connected)
    })
    attachHandlers(gameSocket, 'games', setGamesConnected)
    attachHandlers(chatSocket, 'chat', setChatConnected)

    setSessionsSocket(sessionSocket)
    setGamesSocket(gameSocket)
    setChatSocket(chatSocket)

    // Cleanup on unmount or token change
    return () => {
      sessionSocket.disconnect()
      gameSocket.disconnect()
      chatSocket.disconnect()
    }
  }, [playerToken]) // Reconnect when player token changes

  const reconnect = () => {
    for (const socket of [sessionsSocket, gamesSocket, chatSocket]) {
      if (socket) {
        socket.disconnect()
        socket.connect()
      }
    }
    showToast.info('Reconnecting...')
  }

  return (
    <SocketContext.Provider
      value={{
        sessionsSocket,
        gamesSocket,
        chatSocket,
        isConnected,
        sessionsConnected,
        gamesConnected,
        chatConnected,
        shouldBeConnected: !!playerToken,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
