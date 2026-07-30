import { useState } from 'react'
import { showToast } from '../lib/toast'

interface ShareButtonsProps {
  /** The link to share. */
  url: string
  /** Host-authored message included with the link in everything shared/copied. */
  message?: string
  /** Title used by the native share sheet. */
  subject?: string
}

/**
 * Share an invite across the channels people actually use for game nights.
 * Everything shared — the native share sheet, WhatsApp, and Copy — includes the
 * host's message AND the link (not a bare URL), so the custom message actually
 * travels with the invite. "Share invite" uses the OS share sheet when available
 * (→ iMessage / Mail / anything) and falls back to copying the full invite on
 * desktops without it, so it always does something.
 */
export function ShareButtons({ url, message, subject }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const trimmed = message?.trim()
  // The full invite: message + link. This is what gets shared/copied everywhere.
  const inviteText = trimmed ? `${trimmed}\n\n${url}` : url
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copyInvite = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(inviteText)
      setCopied(true)
      showToast.success('Invite copied — paste it into any chat')
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      showToast.error('Could not copy the invite')
      return false
    }
  }

  const handleShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: subject || 'You’re invited',
          text: inviteText,
        })
        return
      } catch (error) {
        // AbortError = the user dismissed the sheet; anything else → copy.
        if ((error as { name?: string })?.name === 'AbortError') return
      }
    }
    await copyInvite()
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(inviteText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const btn =
    'flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg font-medium text-sm transition-colors'

  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary: OS share sheet, or copy the full invite as a fallback. */}
      <button
        type="button"
        onClick={handleShare}
        className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span>Share invite</span>
      </button>

      <button
        type="button"
        onClick={handleWhatsApp}
        className={`${btn} bg-green-500 text-white hover:bg-green-600`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={copyInvite}
        className={`${btn} bg-gray-100 text-gray-700 hover:bg-gray-200`}
      >
        {copied ? (
          <span className="text-green-600">Copied!</span>
        ) : (
          <span>Copy invite</span>
        )}
      </button>
    </div>
  )
}
