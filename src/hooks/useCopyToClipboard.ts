import { useState } from 'react'
import { showToast } from '../lib/toast'

/**
 * Custom hook for copying text to clipboard
 * Returns [copyFn, { success, error }]
 */
export function useCopyToClipboard() {
  const [state, setState] = useState<{
    success: boolean
    error: Error | null
  }>({
    success: false,
    error: null,
  })

  const copyToClipboard = async (text: string, successMessage?: string) => {
    try {
      // Modern Clipboard API (preferred)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        setState({ success: true, error: null })
        showToast.success(successMessage || 'Copied to clipboard')
        return true
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        setState({ success: true, error: null })
        showToast.success(successMessage || 'Copied to clipboard')
        return true
      } else {
        throw new Error('Copy command failed')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Copy failed')
      setState({ success: false, error: err })
      showToast.error('Failed to copy to clipboard')
      return false
    }
  }

  return [copyToClipboard, state] as const
}
