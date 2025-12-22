import { useState, type KeyboardEvent } from 'react'
import { showToast } from '../lib/toast'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Chat input component with send button
 */
export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled) return

    // Check max length (backend limit is 1000)
    if (trimmedMessage.length > 1000) {
      showToast.warning('Message too long! Maximum 1000 characters.')
      return
    }

    onSendMessage(trimmedMessage)
    setMessage('')
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex-shrink-0">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl sm:rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              fontSize: '16px',
            }}
          />
          {/* Character count */}
          {message.length > 800 && (
            <span
              className={`absolute right-3 bottom-2 text-xs ${
                message.length > 1000 ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {message.length}/1000
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-2xl sm:rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Send message"
        >
          <span className="hidden sm:inline">Send</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Help text - hide on mobile */}
      <p className="hidden sm:block text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
