export type UUID = string

/**
 * Chat message type
 */
export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: UUID
  content: string
  sessionId: UUID
  playerId: UUID
  playerName: string
  type: MessageType
  isEdited: boolean
  createdAt: Date | string
  editedAt?: Date | string
}

/**
 * Chat message event payload (from WebSocket)
 */
export interface ChatMessageEvent {
  message: ChatMessage
  timestamp: string
}

/**
 * Chat history event payload (from WebSocket)
 */
export interface ChatHistoryEvent {
  messages: ChatMessage[]
  hasMore: boolean
  timestamp: string
}

/**
 * Chat error event payload (from WebSocket)
 */
export interface ChatErrorEvent {
  error: string
  code: string
}

/**
 * Send message DTO
 */
export interface SendMessageDto {
  content: string
  sessionId: UUID
  playerId: UUID
}

/**
 * Message history query DTO
 */
export interface MessageHistoryQueryDto {
  sessionId: UUID
  limit?: number
  beforeMessageId?: UUID
}

/**
 * Player online event payload (from WebSocket)
 */
export interface PlayerOnlineEvent {
  sessionId: UUID
  playerId: UUID
  playerName: string
  timestamp: string
}

/**
 * Player offline event payload (from WebSocket)
 */
export interface PlayerOfflineEvent {
  sessionId: UUID
  playerId: UUID
  playerName: string
  timestamp: string
}
