import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePublicRsvpView, useSelfRsvp } from '../lib/api/hooks/use-invite'
import { showToast, toastHelpers } from '../lib/toast'
import LoadingSkeleton from '../components/LoadingSkeleton'
import type { Invite, RsvpResponse } from '../lib/api/services/invite.service'

export const Route = createFileRoute('/rsvp/$token')({
  component: PublicRsvpPage,
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

function PublicRsvpPage() {
  const { token } = Route.useParams()
  const { data: event, isLoading, error } = usePublicRsvpView(token)
  const selfRsvp = useSelfRsvp(token)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [plusOnes, setPlusOnes] = useState(0)
  const [note, setNote] = useState('')
  const [result, setResult] = useState<Invite | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Event not found</h1>
        <p className="text-gray-500 mt-2">
          This RSVP link is invalid or has been deactivated.
        </p>
      </div>
    )
  }

  const submit = (status: RsvpResponse) => {
    const trimmed = name.trim()
    if (!trimmed) {
      showToast.error('Please enter your name first')
      return
    }
    selfRsvp.mutate(
      {
        name: trimmed,
        status,
        email: email.trim() || undefined,
        plusOnes: status === 'GOING' ? plusOnes : 0,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (invite) => {
          setResult(invite)
          showToast.success('Your RSVP is in!')
        },
        onError: (e) => toastHelpers.operationError('submit your RSVP', e),
      },
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
          <p className="text-blue-100 text-sm">You're invited to</p>
          <h1 className="text-2xl font-bold mt-1">{event.sessionName}</h1>
          <p className="text-blue-100 mt-2">📅 {formatDate(event.date)}</p>
          {event.hostName && (
            <p className="text-blue-100 text-sm mt-1">
              Hosted by {event.hostName}
            </p>
          )}
          {event.location && (
            <p className="text-blue-100 text-sm mt-1">📍 {event.location}</p>
          )}
          {event.goingHeadcount > 0 && (
            <p className="text-blue-100 text-sm mt-2">
              🎉 {event.goingHeadcount} going so far
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {event.inviteMessage && !result && (
            <blockquote className="rounded-lg bg-indigo-50 border-l-4 border-indigo-400 px-4 py-3 text-gray-700 text-sm whitespace-pre-wrap">
              {event.inviteMessage}
            </blockquote>
          )}
          {result ? (
            /* Confirmation — with a personal link to edit later. */
            <div className="text-center space-y-3 py-2">
              <div className="text-5xl">
                {result.rsvpStatus === 'GOING'
                  ? '🎉'
                  : result.rsvpStatus === 'MAYBE'
                    ? '🤔'
                    : '😢'}
              </div>
              <p className="text-xl font-bold text-gray-900">
                {result.rsvpStatus === 'GOING'
                  ? "You're going!"
                  : result.rsvpStatus === 'MAYBE'
                    ? 'You said maybe'
                    : "You can't make it"}
              </p>
              <p className="text-gray-500 text-sm">
                Thanks, {result.name}.
                {result.rsvpStatus === 'GOING' && result.plusOnes > 0
                  ? ` Bringing ${result.plusOnes} guest${
                      result.plusOnes > 1 ? 's' : ''
                    }.`
                  : ''}
              </p>
              <a
                href={`/invite/${result.inviteToken}`}
                className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px]"
              >
                Bookmark this to change your response later
              </a>
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
                  Email (optional)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
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
                    disabled={selfRsvp.isPending}
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
