import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useInviteByToken, useRsvp } from '../lib/api/hooks/use-invite'
import { showToast, toastHelpers } from '../lib/toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import type { RsvpResponse } from '../lib/api/services/invite.service'

export const Route = createFileRoute('/invite/$token')({
  component: InviteRsvpPage,
})

const RESPONSES: Array<{ status: RsvpResponse; label: string; style: string }> =
  [
    {
      status: 'GOING',
      label: "I'm going",
      style: 'bg-green-600 hover:bg-green-700',
    },
    {
      status: 'MAYBE',
      label: 'Maybe',
      style: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      status: 'NOT_GOING',
      label: "Can't make it",
      style: 'bg-gray-500 hover:bg-gray-600',
    },
  ]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function InviteRsvpPage() {
  const { token } = Route.useParams()
  const { data: invite, isLoading, error } = useInviteByToken(token)
  const rsvp = useRsvp(token)

  const [name, setName] = useState('')
  const [plusOnes, setPlusOnes] = useState(0)
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)

  // Prefill the name once the invite loads.
  useEffect(() => {
    if (invite?.name) setName(invite.name)
  }, [invite?.name])

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Invite not found</h1>
        <p className="text-gray-500 mt-2">
          This invite link is invalid or has expired.
        </p>
      </div>
    )
  }

  const session = invite.session
  const hasResponded = invite.rsvpStatus !== 'PENDING'

  const submit = (status: RsvpResponse) => {
    rsvp.mutate(
      {
        status,
        name: name.trim() || undefined,
        plusOnes: status === 'GOING' ? plusOnes : 0,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setEditing(false)
          showToast.success('Your RSVP is saved!')
        },
        onError: (e) => toastHelpers.operationError('save your RSVP', e),
      },
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
          <p className="text-blue-100 text-sm">You're invited to</p>
          <h1 className="text-2xl font-bold mt-1">
            {session?.name ?? 'Games Night'}
          </h1>
          {session?.date && (
            <p className="text-blue-100 mt-2">📅 {formatDate(session.date)}</p>
          )}
          {session?.host?.name && (
            <p className="text-blue-100 text-sm mt-1">
              Hosted by {session.host.name}
            </p>
          )}
          {session?.location && (
            <p className="text-blue-100 text-sm mt-1">📍 {session.location}</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {hasResponded && !editing ? (
            /* Confirmed state — clean summary, not the full form. */
            <div className="text-center space-y-3 py-2">
              <div className="text-5xl">
                {invite.rsvpStatus === 'GOING'
                  ? '🎉'
                  : invite.rsvpStatus === 'MAYBE'
                    ? '🤔'
                    : '😢'}
              </div>
              <p className="text-xl font-bold text-gray-900">
                {invite.rsvpStatus === 'GOING'
                  ? "You're going!"
                  : invite.rsvpStatus === 'MAYBE'
                    ? 'You said maybe'
                    : "You can't make it"}
              </p>
              <p className="text-gray-500 text-sm">
                {invite.name
                  ? `Thanks, ${invite.name}.`
                  : 'Thanks for responding.'}
                {invite.rsvpStatus === 'GOING' && invite.plusOnes > 0
                  ? ` Bringing ${invite.plusOnes} guest${
                      invite.plusOnes > 1 ? 's' : ''
                    }.`
                  : ''}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px]"
              >
                Change response
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bringing anyone? (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={plusOnes}
                  onChange={(e) =>
                    setPlusOnes(
                      Math.max(0, Math.min(10, Number(e.target.value))),
                    )
                  }
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything to add?"
                  maxLength={280}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {RESPONSES.map((r) => (
                  <button
                    key={r.status}
                    onClick={() => submit(r.status)}
                    disabled={rsvp.isPending}
                    className={`rounded-lg text-white font-semibold py-3 min-h-[44px] disabled:opacity-50 ${r.style}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
