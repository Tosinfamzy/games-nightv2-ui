import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { JoinSessionForm } from '../components/JoinSessionForm'
import { sessionKeys } from '../lib/api/hooks/use-session'
import type { Session } from '../lib/api/types'

function JoinSessionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleJoinSuccess = (session: Session) => {
    // Invalidate players query to ensure it's fresh when we navigate
    queryClient.invalidateQueries({
      queryKey: sessionKeys.players(session.id),
    })

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
            Already joined before?{' '}
            <Link
              to="/rejoin"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Rejoin a session
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/join')({
  component: JoinSessionPage,
})
