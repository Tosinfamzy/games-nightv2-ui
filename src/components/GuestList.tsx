import { useState } from 'react'
import {
  useAddInvite,
  useInviteSummary,
  useRemoveInvite,
  useSessionInvites,
} from '../lib/api/hooks/use-invite'
import { showToast, toastHelpers } from '../lib/toast'
import { InviteShareCard } from './InviteShareCard'
import type { Invite, RsvpStatus } from '../lib/api/services/invite.service'

const STATUS_STYLES: Record<RsvpStatus, { label: string; className: string }> =
  {
    GOING: { label: 'Going', className: 'bg-green-100 text-green-800' },
    MAYBE: { label: 'Maybe', className: 'bg-yellow-100 text-yellow-800' },
    NOT_GOING: { label: 'Not going', className: 'bg-red-100 text-red-700' },
    PENDING: { label: 'Invited', className: 'bg-gray-100 text-gray-600' },
  }

/** Display order for the grouped guest list. */
const GROUP_ORDER: Array<{ status: RsvpStatus; heading: string }> = [
  { status: 'GOING', heading: 'Going' },
  { status: 'MAYBE', heading: 'Maybe' },
  { status: 'PENDING', heading: 'Invited — no reply' },
  { status: 'NOT_GOING', heading: "Can't make it" },
]

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function GuestRow({
  invite,
  onRemove,
  removing,
}: {
  invite: Invite
  onRemove: (id: string) => void
  removing: boolean
}) {
  const status = STATUS_STYLES[invite.rsvpStatus]

  const copyLink = async () => {
    const url = `${window.location.origin}/invite/${invite.inviteToken}`
    try {
      await navigator.clipboard.writeText(url)
      toastHelpers.copied('invite link')
    } catch {
      showToast.error('Could not copy the link')
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {invite.name || 'Guest'}
          {invite.plusOnes > 0 && (
            <span className="text-gray-500 font-normal">
              {' '}
              +{invite.plusOnes}
            </span>
          )}
          {invite.playerId && (
            <span
              className="ml-1.5 text-green-600"
              title="Checked in — joined the session"
            >
              ✓
            </span>
          )}
        </p>
        {invite.email && (
          <p className="text-xs text-gray-400 truncate">{invite.email}</p>
        )}
        {invite.note && (
          <p className="text-sm text-gray-500 truncate">“{invite.note}”</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
        <button
          onClick={copyLink}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px] px-2"
          title="Copy this guest's personal invite link"
        >
          Copy link
        </button>
        <button
          onClick={() => onRemove(invite.id)}
          disabled={removing}
          className="text-red-500 hover:text-red-600 text-sm font-medium min-h-[44px] px-2 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  )
}

export function GuestList({
  sessionId,
  sessionName,
  publicRsvpToken,
  inviteMessage,
}: {
  sessionId: string
  sessionName: string
  publicRsvpToken?: string
  inviteMessage?: string | null
}) {
  const { data: invites = [], isLoading } = useSessionInvites(sessionId)
  const { data: summary } = useInviteSummary(sessionId)
  const addInvite = useAddInvite(sessionId)
  const removeInvite = useRemoveInvite(sessionId)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addInvite.mutate(
      { name: trimmed, email: email.trim() || undefined },
      {
        onSuccess: () => {
          setName('')
          setEmail('')
          showToast.success(`Added ${trimmed} to the guest list`)
        },
        onError: (error) => toastHelpers.operationError('add guest', error),
      },
    )
  }

  const handleRemove = (id: string) => {
    removeInvite.mutate(id, {
      onError: (error) => toastHelpers.operationError('remove guest', error),
    })
  }

  return (
    <div className="space-y-6">
      {/* RSVP tallies */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatCard label="Going" value={summary?.going ?? 0} />
        <StatCard label="Maybe" value={summary?.maybe ?? 0} />
        <StatCard label="Not going" value={summary?.notGoing ?? 0} />
        <StatCard label="Invited" value={summary?.pending ?? 0} />
        <StatCard label="Headcount" value={summary?.headcount ?? 0} />
      </div>

      {/* Single shareable link + host message */}
      <InviteShareCard
        sessionId={sessionId}
        sessionName={sessionName}
        publicRsvpToken={publicRsvpToken}
        inviteMessage={inviteMessage}
      />

      {/* Add guest */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-2 items-stretch"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
          maxLength={80}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email (optional)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!name.trim() || addInvite.isPending}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 min-h-[44px] disabled:opacity-50"
        >
          {addInvite.isPending ? 'Adding…' : 'Add guest'}
        </button>
      </form>

      {/* Guest list, grouped by RSVP status */}
      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading guest list…</p>
      ) : invites.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No guests yet. Share the link above, or add someone directly.
        </p>
      ) : (
        <div className="space-y-5">
          {GROUP_ORDER.map(({ status, heading }) => {
            const group = invites.filter((i) => i.rsvpStatus === status)
            if (group.length === 0) return null
            return (
              <div key={status}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  {heading} ({group.length})
                </h3>
                <ul className="divide-y divide-gray-100">
                  {group.map((invite) => (
                    <GuestRow
                      key={invite.id}
                      invite={invite}
                      onRemove={handleRemove}
                      removing={removeInvite.isPending}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
