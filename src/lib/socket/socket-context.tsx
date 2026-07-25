import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { showToast } from '../toast'
import { usePlayer } from '../../contexts/PlayerContext'
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
      console.log('No player token available, skipping socket connections')
      return
    }

    console.log('Creating socket connections with player token')

    // Create sessions namespace socket with authentication
    const sessionSocket = io(`${API_URL}/sessions`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.1,
      auth: {
        playerToken,
      },
    })

    // Create games namespace socket with authentication
    const gameSocket = io(`${API_URL}/games`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.1,
      auth: {
        playerToken,
      },
    })

    // Create chat namespace socket with authentication
    const chatSocket = io(`${API_URL}/chat`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.1,
      auth: {
        playerToken,
      },
    })

    // Connection handlers for sessions socket
    sessionSocket.on('connect', () => {
      console.log('Sessions socket connected:', sessionSocket.id)
      setSessionsConnected(true)
      setIsConnected(true)
    })

    sessionSocket.on('disconnect', () => {
      console.log('Sessions socket disconnected')
      setSessionsConnected(false)
      setIsConnected(false)
    })

    sessionSocket.on('connect_error', (error) => {
      console.error('Sessions socket connection error:', error)

      let message = 'Failed to connect to sessions. '
      const errorMessage = error?.message?.toLowerCase() || ''

      if (errorMessage.includes('cors')) {
        message += 'Server configuration issue detected.'
      } else if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('token')
      ) {
        message += 'Your session expired. Please rejoin.'
        // Clear invalid token after short delay to allow user to see error
        setTimeout(() => {
          window.location.href = '/rejoin'
        }, 3000)
      } else if (errorMessage.includes('econnrefused')) {
        message += 'Server is unreachable. Please check your connection.'
      } else {
        message += 'Retrying...'
      }

      showToast.error(message)
    })

    sessionSocket.on('reconnect_failed', () => {
      console.error('Sessions socket reconnection failed')
      showToast.error(
        'Unable to reconnect to sessions. Please refresh the page.',
        10000,
      )
    })

    // Connection handlers for games socket
    gameSocket.on('connect', () => {
      console.log('Games socket connected:', gameSocket.id)
      setGamesConnected(true)
    })

    gameSocket.on('disconnect', () => {
      console.log('Games socket disconnected')
      setGamesConnected(false)
    })

    gameSocket.on('connect_error', (error) => {
      console.error('Games socket connection error:', error)

      let message = 'Failed to connect to games. '
      const errorMessage = error?.message?.toLowerCase() || ''

      if (errorMessage.includes('cors')) {
        message += 'Server configuration issue detected.'
      } else if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('token')
      ) {
        message += 'Your session expired. Please rejoin.'
        setTimeout(() => {
          window.location.href = '/rejoin'
        }, 3000)
      } else if (errorMessage.includes('econnrefused')) {
        message += 'Server is unreachable. Please check your connection.'
      } else {
        message += 'Retrying...'
      }

      showToast.error(message)
    })

    gameSocket.on('reconnect_failed', () => {
      console.error('Games socket reconnection failed')
      showToast.error(
        'Unable to reconnect to games. Please refresh the page.',
        10000,
      )
    })

    // Connection handlers for chat socket
    chatSocket.on('connect', () => {
      console.log('Chat socket connected:', chatSocket.id)
      setChatConnected(true)
    })

    chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected')
      setChatConnected(false)
    })

    chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error)

      let message = 'Failed to connect to chat. '
      const errorMessage = error?.message?.toLowerCase() || ''

      if (errorMessage.includes('cors')) {
        message += 'Server configuration issue detected.'
      } else if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('token')
      ) {
        message += 'Your session expired. Please rejoin.'
        setTimeout(() => {
          window.location.href = '/rejoin'
        }, 3000)
      } else if (errorMessage.includes('econnrefused')) {
        message += 'Server is unreachable. Please check your connection.'
      } else {
        message += 'Retrying...'
      }

      showToast.error(message)
    })

    chatSocket.on('reconnect_failed', () => {
      console.error('Chat socket reconnection failed')
      showToast.error(
        'Unable to reconnect to chat. Please refresh the page.',
        10000,
      )
    })

    setSessionsSocket(sessionSocket)
    setGamesSocket(gameSocket)
    setChatSocket(chatSocket)

    // Cleanup on unmount or token change
    return () => {
      console.log('Disconnecting sockets (cleanup)')
      sessionSocket.disconnect()
      gameSocket.disconnect()
      chatSocket.disconnect()
    }
  }, [playerToken]) // Reconnect when player token changes

  const reconnect = () => {
    console.log('Manual reconnect triggered')
    if (sessionsSocket) {
      sessionsSocket.disconnect()
      sessionsSocket.connect()
    }
    if (gamesSocket) {
      gamesSocket.disconnect()
      gamesSocket.connect()
    }
    if (chatSocket) {
      chatSocket.disconnect()
      chatSocket.connect()
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
