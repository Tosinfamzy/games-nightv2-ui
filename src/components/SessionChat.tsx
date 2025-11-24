import { useEffect } from 'react';
import { useChatSocket } from '../lib/socket/use-chat-socket';
import { handleWebSocketError } from '../lib/utils/socket-error-handler';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

interface SessionChatProps {
  sessionId: string;
  playerId: string;
  className?: string;
}

/**
 * Main chat component for a session
 * Connects to WebSocket, manages messages, and renders chat UI
 */
export default function SessionChat({
  sessionId,
  playerId,
  className = '',
}: SessionChatProps) {
  const {
    isConnected,
    messages,
    hasMore,
    error,
    sendMessage,
    loadHistory,
    loadMoreMessages,
    clearError,
  } = useChatSocket(sessionId, playerId);

  // Load initial message history when connected
  useEffect(() => {
    if (isConnected && sessionId) {
      loadHistory(50);
    }
  }, [isConnected, sessionId, loadHistory]);

  // Handle WebSocket errors
  useEffect(() => {
    if (error) {
      const processedError = handleWebSocketError({
        error,
        code: 'ChatError',
      });
      console.error('Chat error:', processedError.message);
      // Error will be displayed in UI
    }
  }, [error]);

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
      style={{ height: '700px' }}
    >
      {/* Chat header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Session Chat</h2>
            <p className="text-sm text-blue-100 mt-1">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Connecting...
                </span>
              )}
            </p>
          </div>

          {/* Message count */}
          <div className="text-right">
            <p className="text-2xl font-bold">{messages.length}</p>
            <p className="text-sm text-blue-100">messages</p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Connection warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm text-yellow-800">
              Connecting to chat server...
            </span>
          </div>
        </div>
      )}

      {/* Message list */}
      <ChatMessageList
        messages={messages}
        currentPlayerId={playerId}
        hasMore={hasMore}
        onLoadMore={loadMoreMessages}
      />

      {/* Message input */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={!isConnected}
        placeholder={
          isConnected ? 'Type a message...' : 'Connecting to chat...'
        }
      />
    </div>
  );
}
