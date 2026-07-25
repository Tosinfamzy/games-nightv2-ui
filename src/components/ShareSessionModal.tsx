import { useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { fetchAPI } from '../lib/api/client'
import { showToast, toastHelpers } from '../lib/toast'
import { ConfirmDialog } from './ConfirmDialog'
import { ShareSessionButtons } from './ShareSessionButtons'
import type { UUID } from '../lib/api/types'

interface ShareSessionModalProps {
  sessionId: UUID
  joinCode: string
  sessionName: string
  isOpen: boolean
  onClose: () => void
  isHost?: boolean
}

export default function ShareSessionModal({
  sessionId,
  joinCode,
  sessionName,
  isOpen,
  onClose,
  isHost = false,
}: ShareSessionModalProps) {
  const [copyToClipboard] = useCopyToClipboard()
  const queryClient = useQueryClient()
  const [currentJoinCode, setCurrentJoinCode] = useState(joinCode)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !showConfirmDialog) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, showConfirmDialog])

  // Focus trapping within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTabKey)
    return () => modal.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Construct shareable link
  const shareableLink = `${window.location.origin}/join/${currentJoinCode}`

  // Regenerate join code mutation
  const regenerateCodeMutation = useMutation({
    mutationFn: async () => {
      return fetchAPI<{ joinCode: string }>(
        `/sessions/${sessionId}/regenerate-code`,
        {
          method: 'POST',
        },
      )
    },
    onSuccess: (data) => {
      setCurrentJoinCode(data.joinCode)
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      showToast.success('Join code regenerated successfully')
    },
    onError: (error) => {
      toastHelpers.operationError('regenerate join code', error)
    },
  })

  const handleCopyLink = () => {
    copyToClipboard(shareableLink, 'Share link copied to clipboard!')
  }

  const handleCopyCode = () => {
    copyToClipboard(currentJoinCode, 'Join code copied to clipboard!')
  }

  const handleRegenerateCode = () => {
    setShowConfirmDialog(true)
  }

  const confirmRegenerateCode = () => {
    regenerateCodeMutation.mutate()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="share-modal-title" className="text-2xl font-bold">
            Share Session
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close share session modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Session Name */}
          <div>
            <p className="text-sm text-gray-600">Session</p>
            <p className="text-lg font-semibold">{sessionName}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Scan to Join
            </p>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode value={shareableLink} size={200} />
            </div>
          </div>

          {/* Join Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Join Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentJoinCode}
                readOnly
                className="flex-1 px-4 py-3 text-2xl font-mono text-center border rounded-lg bg-gray-50 focus:outline-none"
                style={{ fontSize: '24px' }}
              />
              <button
                onClick={handleCopyCode}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-base min-h-[44px]"
                aria-label="Copy join code to clipboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>

          {/* Shareable Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-sm focus:outline-none overflow-x-auto"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-base min-h-[44px]"
                aria-label="Copy share link to clipboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="hidden sm:inline">Copy Link</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can join the session
            </p>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-4 border-t">
            <ShareSessionButtons
              joinCode={currentJoinCode}
              sessionName={sessionName}
            />
          </div>

          {/* Regenerate Code Button (Host Only) */}
          {isHost && (
            <div className="pt-4 border-t">
              <button
                onClick={handleRegenerateCode}
                disabled={regenerateCodeMutation.isPending}
                className="w-full px-4 py-3 text-base text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {regenerateCodeMutation.isPending
                  ? 'Regenerating...'
                  : 'Regenerate Join Code'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This will invalidate the old join code
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-base"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Regenerate Join Code?"
        message="Are you sure you want to regenerate the join code? The old code will no longer work and players using it won't be able to join."
        confirmText="Regenerate"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmRegenerateCode}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  )
}
