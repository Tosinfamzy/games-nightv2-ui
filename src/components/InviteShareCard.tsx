import { useState } from 'react'
import { useUpdateSession } from '../lib/api/hooks/use-session'
import { showToast, toastHelpers } from '../lib/toast'
import { ShareButtons } from './ShareButtons'

const INVITE_MESSAGE_MAX = 500

interface InviteShareCardProps {
  sessionId: string
  sessionName: string
  publicRsvpToken?: string
  inviteMessage?: string | null
}

/**
 * Compose-and-share the invite for a session: a host-authored message plus the
 * open self-serve RSVP link, shareable via the native share sheet / WhatsApp /
 * copy. The message is saved on the session (so it also greets guests on the
 * RSVP page) and travels with everything shared. Self-contained — it keeps the
 * saved message in local state, so it works even on screens that don't refetch
 * the session (e.g. the Session Created page).
 */
export function InviteShareCard({
  sessionId,
  sessionName,
  publicRsvpToken,
  inviteMessage,
}: InviteShareCardProps) {
  const updateSession = useUpdateSession()
  const [savedMessage, setSavedMessage] = useState(inviteMessage ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  if (!publicRsvpToken) return null
  const url = `${window.location.origin}/rsvp/${publicRsvpToken}`

  const saved = savedMessage.trim()
  // What actually gets shared: the host's message, or a friendly default.
  const effectiveMessage =
    saved || `You're invited to ${sessionName}! RSVP here:`

  const startEditing = () => {
    setDraft(saved)
    setEditing(true)
  }

  const save = () => {
    const next = draft.trim()
    updateSession.mutate(
      { id: sessionId, data: { inviteMessage: next } },
      {
        onSuccess: () => {
          setSavedMessage(next)
          setEditing(false)
          showToast.success(
            next ? 'Invite message saved' : 'Invite message cleared',
          )
        },
        onError: (error) =>
          toastHelpers.operationError('save the invite message', error),
      },
    )
  }

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-blue-900">Your invite message</p>
        {!editing && (
          <button
            onClick={startEditing}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {saved ? 'Edit message' : 'Add a message'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) =>
              setDraft(e.target.value.slice(0, INVITE_MESSAGE_MAX))
            }
            rows={3}
            placeholder={`You're invited to ${sessionName}! Bring snacks and your A-game 🎲`}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-blue-600">
              {draft.length}/{INVITE_MESSAGE_MAX}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium min-h-[44px] px-3"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={updateSession.isPending}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 min-h-[44px] disabled:opacity-50"
              >
                {updateSession.isPending ? 'Saving…' : 'Save message'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-blue-800 whitespace-pre-wrap">
          “{effectiveMessage}”
          {!saved && (
            <span className="text-blue-500 italic">
              {' '}
              (default — tap to personalise)
            </span>
          )}
        </p>
      )}

      <p className="text-xs text-blue-700 truncate">{url}</p>

      {!editing && (
        <ShareButtons
          url={url}
          message={effectiveMessage}
          subject={`You're invited to ${sessionName}`}
        />
      )}
      <p className="text-xs text-blue-600">
        Anyone with this link can RSVP themselves — drop it in the group chat.
      </p>
    </div>
  )
}
