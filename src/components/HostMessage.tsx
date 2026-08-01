import { useState } from 'react'
import { useUpdateSession } from '../lib/api/hooks/use-session'
import { showToast, toastHelpers } from '../lib/toast'

const MAX_LEN = 1000

/**
 * "From your host" info block — practical, on-the-night details every guest
 * needs once they've arrived: WiFi, house rules, "snacks in the kitchen". Shown
 * to everyone on the session page; the host gets inline add/edit. Distinct from
 * the invite message, which is the pre-event RSVP greeting.
 */
export function HostMessage({
  sessionId,
  hostMessage,
  isHost,
}: {
  sessionId: string
  hostMessage?: string | null
  isHost: boolean
}) {
  const update = useUpdateSession()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  // Guests never see an empty block; only the host sees the "add" affordance.
  if (!hostMessage && !isHost) return null

  const openEditor = () => {
    setDraft(hostMessage ?? '')
    setEditing(true)
  }

  const save = () => {
    update.mutate(
      { id: sessionId, data: { hostMessage: draft.trim() } },
      {
        onSuccess: () => {
          setEditing(false)
          showToast.success('Guest info updated')
        },
        onError: (e) => toastHelpers.operationError('update guest info', e),
      },
    )
  }

  if (editing) {
    return (
      <div className="mb-4 sm:mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4">
        <label className="block text-sm font-semibold text-indigo-900 mb-1">
          ℹ️ Guest info
        </label>
        <p className="text-xs text-indigo-700/80 mb-2">
          Shown to everyone once they've joined — WiFi, house rules, where the
          snacks are.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_LEN}
          rows={4}
          autoFocus
          placeholder={
            'WiFi: GamesNight / pw: rolldice20\nSnacks in the kitchen 🍿'
          }
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={save}
            disabled={update.isPending}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 min-h-[44px] disabled:opacity-50"
          >
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={update.isPending}
            className="rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium px-4 py-2 min-h-[44px]"
          >
            Cancel
          </button>
          <span className="ml-auto text-xs text-gray-400">
            {draft.length}/{MAX_LEN}
          </span>
        </div>
      </div>
    )
  }

  // Host, nothing set yet — offer to add it.
  if (!hostMessage) {
    return (
      <button
        onClick={openEditor}
        className="mb-4 sm:mb-6 w-full rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-sm font-medium py-3 min-h-[44px]"
      >
        ＋ Add guest info (WiFi, house rules…)
      </button>
    )
  }

  return (
    <div className="mb-4 sm:mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-indigo-900">
          ℹ️ From your host
        </p>
        {isHost && (
          <button
            onClick={openEditor}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium min-h-[44px] -my-2"
          >
            Edit
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-indigo-900 whitespace-pre-wrap break-words">
        {hostMessage}
      </p>
    </div>
  )
}
