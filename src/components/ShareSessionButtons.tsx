import { useState } from 'react'
import { showToast } from '../lib/toast'

interface ShareSessionButtonsProps {
  joinCode: string
  sessionName?: string
}

/**
 * Social share buttons for session invites
 * Provides WhatsApp, SMS, Email, and Copy Link options
 */
export function ShareSessionButtons({
  joinCode,
  sessionName,
}: ShareSessionButtonsProps) {
  const [isCopying, setIsCopying] = useState(false)

  // Generate join URL and share message
  const joinUrl = `${window.location.origin}/join/${joinCode}`
  const sessionTitle = sessionName || 'Game Night'
  const shareMessage = `Join my ${sessionTitle} session!\n\nCode: ${joinCode}\nOr click: ${joinUrl}`

  const handleCopyLink = async () => {
    try {
      setIsCopying(true)
      await navigator.clipboard.writeText(joinUrl)
      showToast.success('Link copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      showToast.error('Failed to copy link')
    } finally {
      setTimeout(() => setIsCopying(false), 2000)
    }
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSMSShare = () => {
    // iOS uses & as separator, Android uses ?
    const smsUrl = `sms:${navigator.userAgent.match(/iPhone|iPad|iPod/i) ? '&' : '?'}body=${encodeURIComponent(shareMessage)}`
    window.location.href = smsUrl
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join my ${sessionTitle}!`)
    const body = encodeURIComponent(
      `Hi there!\n\nI'd like to invite you to join my ${sessionTitle} session.\n\nSession Code: ${joinCode}\n\nQuick Join Link: ${joinUrl}\n\nSee you there!`,
    )
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Share Invite</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          disabled={isCopying}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base disabled:opacity-50"
        >
          {isCopying ? (
            <>
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
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
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-base"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* SMS Button */}
        <button
          onClick={handleSMSShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-base"
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>SMS</span>
        </button>

        {/* Email Button */}
        <button
          onClick={handleEmailShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-base"
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Email</span>
        </button>
      </div>
    </div>
  )
}
