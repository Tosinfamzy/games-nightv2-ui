import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { CreateSessionForm } from '../../components/CreateSessionForm'
import { SessionDisplay } from '../../components/SessionDisplay'
import { InviteShareCard } from '../../components/InviteShareCard'
import type { Session } from '../../lib/api/types'

export const Route = createFileRoute('/sessions/new')({
  component: NewSessionPage,
})

function NewSessionPage() {
  const [createdSession, setCreatedSession] = useState<Session | null>(null)
  const navigate = useNavigate()

  const handleCreateSuccess = (session: Session) => {
    setCreatedSession(session)
  }

  if (createdSession) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Session Created!
              </h1>
              <p className="text-gray-600">
                Invite guests to RSVP, or share the join code to play now
              </p>
            </div>

            <SessionDisplay session={createdSession} />

            {/* Invite composer — write a message + share the RSVP link, for
                collecting RSVPs ahead of the day. Distinct from the join code
                above, which is for joining the live session. */}
            {createdSession.publicRsvpToken && (
              <div className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    📨 Invite guests to RSVP
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add a personal message and share the link so people can RSVP
                    before the day. (The join code above is for joining live on
                    games night.)
                  </p>
                </div>

                <InviteShareCard
                  sessionId={createdSession.id}
                  sessionName={createdSession.name}
                  publicRsvpToken={createdSession.publicRsvpToken}
                  inviteMessage={createdSession.inviteMessage}
                />

                <button
                  onClick={() =>
                    navigate({
                      to: '/sessions/$id',
                      params: { id: createdSession.id },
                    })
                  }
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Manage guest list →
                </button>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCreatedSession(null)}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create Another Session
              </button>
              <button
                onClick={() => navigate({ to: '/sessions' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                View All Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Session
            </h1>
            <p className="text-gray-600">
              Set up a new game night for your friends
            </p>
          </div>

          <CreateSessionForm onCreateSuccess={handleCreateSuccess} />
        </div>
      </div>
    </div>
  )
}
