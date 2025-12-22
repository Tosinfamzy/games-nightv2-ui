import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning' | 'info'
  confirmVariant?: 'danger' | 'primary' | 'warning' | 'info'
  onConfirm: () => void
  onClose?: () => void
  onCancel?: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  variant,
  confirmVariant,
  onConfirm,
  onClose,
  onCancel,
}: ConfirmDialogProps) {
  // Support both onClose and onCancel for backwards compatibility
  const handleClose = onClose || onCancel || (() => {})
  // Support both confirmText and confirmLabel
  const confirmButtonText = confirmText || confirmLabel || 'Confirm'
  // Support both variant and confirmVariant
  const buttonVariant = variant || confirmVariant || 'primary'
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus cancel button when dialog opens (safer default)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle ESC key to cancel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  // Focus trapping within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    dialog.addEventListener('keydown', handleTabKey)
    return () => dialog.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  if (!isOpen) return null

  const confirmButtonClasses =
    buttonVariant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : buttonVariant === 'warning'
        ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
        : buttonVariant === 'info'
          ? 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-yellow-100">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3
          id="confirm-dialog-title"
          className="text-lg font-semibold text-gray-900 text-center"
        >
          {title}
        </h3>

        {/* Message */}
        <p
          id="confirm-dialog-message"
          className="text-sm text-gray-600 text-center"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            onClick={handleClose}
            className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              handleClose() // Close dialog after confirming
            }}
            className={`w-full sm:flex-1 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium text-base ${confirmButtonClasses}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}
