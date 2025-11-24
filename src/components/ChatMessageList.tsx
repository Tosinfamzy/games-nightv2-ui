import { useEffect, useRef, useState } from 'react';
import { ChatMessage as ChatMessageType } from '../lib/api/types';
import ChatMessage from './ChatMessage';

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentPlayerId?: string;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

/**
 * Chat message list with auto-scroll and load more functionality
 */
export default function ChatMessageList({
  messages,
  currentPlayerId,
  hasMore,
  onLoadMore,
  isLoading = false,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Check if user is near bottom of chat
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    // Load more messages when scrolling to top
    const isNearTop = scrollTop < 100;
    if (isNearTop && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-gray-50 p-4"
      style={{ maxHeight: '600px' }}
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="text-center mb-4">
          {isLoading ? (
            <div className="inline-block">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-1">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            currentPlayerId={currentPlayerId}
          />
        ))}
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
