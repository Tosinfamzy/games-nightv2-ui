import { MessageType } from '../lib/api/types'
import type { ChatMessage as ChatMessageType } from '../lib/api/types'

interface ChatMessageProps {
  message: ChatMessageType
  currentPlayerId?: string
}

/**
 * Individual chat message component
 */
export default function ChatMessage({
  message,
  currentPlayerId,
}: ChatMessageProps) {
  const isOwnMessage = message.playerId === currentPlayerId
  const isSystemMessage = message.type === MessageType.SYSTEM

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // System messages (join/leave notifications, etc.)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  // Regular chat messages
  return (
    <div
      className={`flex mb-3 animate-slide-up ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {/* Player name (only show for other players' messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 px-2">
            {message.playerName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Timestamp and edited indicator */}
        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>
      </div>
    </div>
  )
}
