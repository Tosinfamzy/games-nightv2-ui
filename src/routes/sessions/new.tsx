import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { CreateSessionForm } from '../../components/CreateSessionForm'
import { SessionDisplay } from '../../components/SessionDisplay'
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
                Share the join code below with your players
              </p>
            </div>

            <SessionDisplay session={createdSession} />

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
