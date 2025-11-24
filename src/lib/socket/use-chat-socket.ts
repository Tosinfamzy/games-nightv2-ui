import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from './socket-context';

export interface ChatMessage {
  id: string;
  content: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  type: 'text' | 'system';
  isEdited: boolean;
  createdAt: Date;
}

export interface ChatMessageEvent {
  message: ChatMessage;
  timestamp: string;
}

export interface ChatHistoryEvent {
  messages: ChatMessage[];
  hasMore: boolean;
  timestamp: string;
}

export interface ChatErrorEvent {
  error: string;
  code: string;
}

/**
 * Hook to connect to chat and listen for real-time messages
 */
export const useChatSocket = (sessionId: string | undefined, playerId: string | undefined) => {
  const { chatSocket, isConnected } = useSocketContext();
  const hasJoinedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join chat room
  useEffect(() => {
    if (!chatSocket || !sessionId || !playerId || !isConnected || hasJoinedRef.current) {
      return;
    }

    console.log(`Joining chat for session: ${sessionId}`);
    chatSocket.emit('join-chat', { sessionId, playerId });
    hasJoinedRef.current = true;

    return () => {
      if (chatSocket && sessionId && playerId) {
        console.log(`Leaving chat for session: ${sessionId}`);
        chatSocket.emit('leave-chat', { sessionId, playerId });
        hasJoinedRef.current = false;
      }
    };
  }, [chatSocket, sessionId, playerId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!chatSocket || !sessionId) return;

    const handleMessageSent = (data: ChatMessageEvent) => {
      console.log('New message received:', data);
      setMessages((prev) => [...prev, data.message]);
    };

    chatSocket.on('chat:message-sent', handleMessageSent);

    return () => {
      chatSocket.off('chat:message-sent', handleMessageSent);
    };
  }, [chatSocket, sessionId]);

  // Listen for message history
  useEffect(() => {
    if (!chatSocket || !sessionId) return;

    const handleHistoryLoaded = (data: ChatHistoryEvent) => {
      console.log('Chat history loaded:', data);
      setMessages(data.messages);
      setHasMore(data.hasMore);
    };

    chatSocket.on('chat:history-loaded', handleHistoryLoaded);

    return () => {
      chatSocket.off('chat:history-loaded', handleHistoryLoaded);
    };
  }, [chatSocket, sessionId]);

  // Listen for errors
  useEffect(() => {
    if (!chatSocket) return;

    const handleError = (data: ChatErrorEvent) => {
      console.error('Chat error:', data);
      setError(data.error);
    };

    chatSocket.on('chat:error', handleError);

    return () => {
      chatSocket.off('chat:error', handleError);
    };
  }, [chatSocket]);

  // Send message
  const sendMessage = useCallback(
    (content: string) => {
      if (!chatSocket || !sessionId || !playerId) {
        console.error('Cannot send message: missing socket, sessionId, or playerId');
        return;
      }

      if (!content.trim()) {
        console.warn('Cannot send empty message');
        return;
      }

      chatSocket.emit('send-message', {
        content: content.trim(),
        sessionId,
        playerId,
      });
    },
    [chatSocket, sessionId, playerId]
  );

  // Load message history
  const loadHistory = useCallback(
    (limit: number = 50, beforeMessageId?: string) => {
      if (!chatSocket || !sessionId) {
        console.error('Cannot load history: missing socket or sessionId');
        return;
      }

      chatSocket.emit('load-history', {
        sessionId,
        limit,
        beforeMessageId,
      });
    },
    [chatSocket, sessionId]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!hasMore || messages.length === 0) return;

    const oldestMessage = messages[0];
    loadHistory(50, oldestMessage.id);
  }, [hasMore, messages, loadHistory]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
  };
};
