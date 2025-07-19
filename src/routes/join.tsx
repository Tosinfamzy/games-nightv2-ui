import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { JoinSessionForm } from '../components/JoinSessionForm'
import type { Session } from '../types'

function JoinSessionPage() {
  const navigate = useNavigate()

  const handleJoinSuccess = (session: Session) => {
    // Navigate to the session dashboard
    navigate({
      to: '/sessions/$id',
      params: { id: session.id },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <JoinSessionForm onJoinSuccess={handleJoinSuccess} />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have a session code?{' '}
            <a
              href="/sessions"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse active sessions
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/join')({
  component: JoinSessionPage,
})
