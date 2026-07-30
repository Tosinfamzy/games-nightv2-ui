import { useCallback, useEffect, useRef, useState } from 'react'
import { showToast } from '../toast'
import { useNotifications } from '../../hooks/useNotifications'
import { useSocketContext } from './socket-context'

export interface ChatMessage {
  id: string
  content: string
  sessionId: string
  playerId: string
  playerName: string
  type: 'text' | 'system'
  isEdited: boolean
  createdAt: Date
}

export interface ChatMessageEvent {
  message: ChatMessage
  timestamp: string
}

export interface ChatHistoryEvent {
  messages: Array<ChatMessage>
  hasMore: boolean
  timestamp: string
}

export interface ChatErrorEvent {
  error: string
  code: string
}

/**
 * Hook to connect to chat and listen for real-time messages
 */
export const useChatSocket = (
  sessionId: string | undefined,
  playerId: string | undefined,
) => {
  // Gate on the /chat namespace's own connection, and drive the reconnect-
  // backfill (below) off it too, so chat isn't tied to the /sessions socket.
  const { chatSocket, chatConnected: isConnected } = useSocketContext()
  const hasJoinedRef = useRef(false)
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { notifyNewMessage } = useNotifications()

  // Join chat room
  useEffect(() => {
    if (
      !chatSocket ||
      !sessionId ||
      !playerId ||
      !isConnected ||
      hasJoinedRef.current
    ) {
      return
    }

    console.log(`Joining chat for session: ${sessionId}`)
    chatSocket.emit('join-chat', { sessionId, playerId })
    hasJoinedRef.current = true

    return () => {
      if (chatSocket && sessionId && playerId) {
        console.log(`Leaving chat for session: ${sessionId}`)
        chatSocket.emit('leave-chat', { sessionId, playerId })
        hasJoinedRef.current = false
      }
    }
  }, [chatSocket, sessionId, playerId, isConnected])

  // Listen for new messages
  useEffect(() => {
    if (!chatSocket || !sessionId) return

    const handleMessageSent = (data: ChatMessageEvent) => {
      try {
        console.log('New message received:', data)

        if (!data?.message?.id || !data?.message?.content) {
          throw new Error('Invalid message event: missing required fields')
        }

        setMessages((prev) => [...prev, data.message])

        // Notify about new message (only if not from current player and not a system message)
        if (
          data.message.playerId !== playerId &&
          data.message.type === 'text' &&
          data.message.playerName &&
          data.message.content
        ) {
          notifyNewMessage(data.message.playerName, data.message.content)
        }
      } catch (error) {
        console.error('Error handling new message:', error)
        showToast.error('Failed to display new message. Please refresh.')
      }
    }

    chatSocket.on('chat:message-sent', handleMessageSent)

    return () => {
      chatSocket.off('chat:message-sent', handleMessageSent)
    }
  }, [chatSocket, sessionId])

  // Listen for message history
  useEffect(() => {
    if (!chatSocket || !sessionId) return

    const handleHistoryLoaded = (data: ChatHistoryEvent) => {
      try {
        console.log('Chat history loaded:', data)

        if (!data?.messages || !Array.isArray(data.messages)) {
          throw new Error('Invalid history data: messages must be an array')
        }

        // Merge with what we already have (dedupe by id) and keep the list
        // sorted oldest -> newest. This makes the initial load and "load older"
        // pagination both correct — older pages prepend rather than replacing the
        // list — and stays chronological regardless of the server's order.
        setMessages((prev) => {
          const byId = new Map<string, ChatMessage>()
          for (const message of [...data.messages, ...prev]) {
            byId.set(message.id, message)
          }
          return Array.from(byId.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
        })
        setHasMore(data.hasMore)
      } catch (error) {
        console.error('Error handling chat history:', error)
        showToast.error('Failed to load chat history. Please refresh.')
      }
    }

    chatSocket.on('chat:history-loaded', handleHistoryLoaded)

    return () => {
      chatSocket.off('chat:history-loaded', handleHistoryLoaded)
    }
  }, [chatSocket, sessionId])

  // Listen for errors
  useEffect(() => {
    if (!chatSocket) return

    const handleError = (data: ChatErrorEvent) => {
      try {
        console.error('Chat error:', data)

        const errorMessage = data?.error || 'An unknown chat error occurred'
        setError(errorMessage)

        // Show user-friendly error message. Codes must match what the gateway
        // actually emits (RATE_LIMITED / TOKEN_INVALID), not the old guesses.
        if (data?.code === 'MESSAGE_TOO_LONG') {
          showToast.error('Message is too long. Please shorten it.')
        } else if (data?.code === 'RATE_LIMITED') {
          showToast.error("Slow down! You're sending messages too quickly.")
        } else if (data?.code === 'TOKEN_INVALID') {
          showToast.error('Your session expired — please rejoin to chat.')
        } else {
          showToast.error(`Chat error: ${errorMessage}`)
        }
      } catch (error) {
        console.error('Error handling chat error event:', error)
        showToast.error('A chat error occurred.')
      }
    }

    chatSocket.on('chat:error', handleError)

    return () => {
      chatSocket.off('chat:error', handleError)
    }
  }, [chatSocket])

  // Send message
  const sendMessage = useCallback(
    (content: string) => {
      try {
        if (!chatSocket || !sessionId || !playerId) {
          console.error(
            'Cannot send message: missing socket, sessionId, or playerId',
          )
          showToast.error('Unable to send message. Please refresh.')
          return
        }

        if (!content.trim()) {
          console.warn('Cannot send empty message')
          return
        }

        chatSocket.emit('send-message', {
          content: content.trim(),
          sessionId,
          playerId,
        })
      } catch (error) {
        console.error('Error sending message:', error)
        showToast.error('Failed to send message. Please try again.')
      }
    },
    [chatSocket, sessionId, playerId],
  )

  // Load message history
  const loadHistory = useCallback(
    (limit: number = 50, beforeMessageId?: string) => {
      try {
        if (!chatSocket || !sessionId) {
          console.error('Cannot load history: missing socket or sessionId')
          showToast.error('Unable to load chat history. Please refresh.')
          return
        }

        chatSocket.emit('load-history', {
          sessionId,
          limit,
          beforeMessageId,
        })
      } catch (error) {
        console.error('Error loading chat history:', error)
        showToast.error('Failed to load chat history. Please try again.')
      }
    },
    [chatSocket, sessionId],
  )

  // Refetch history whenever the socket (re)connects, so messages sent during
  // a transient disconnect aren't silently missed (chat has no polling
  // fallback). Also covers the initial load.
  const wasConnectedRef = useRef(false)
  useEffect(() => {
    if (isConnected && !wasConnectedRef.current && sessionId) {
      loadHistory(50)
    }
    wasConnectedRef.current = isConnected
  }, [isConnected, sessionId, loadHistory])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!hasMore || messages.length === 0) return

    const oldestMessage = messages[0]
    loadHistory(50, oldestMessage.id)
  }, [hasMore, messages, loadHistory])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isConnected,
    socket: chatSocket,
    messages,
    hasMore,
    error,
    sendMessage,
    loadHistory,
    loadMoreMessages,
    clearError,
  }
}
