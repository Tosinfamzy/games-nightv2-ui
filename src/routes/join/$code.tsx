import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { JoinSessionForm } from '../../components/JoinSessionForm'
import { sessionKeys } from '../../lib/api/hooks/use-session'
import type { Session } from '../../lib/api/types'

function JoinWithCodePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { code } = Route.useParams()

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
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Quick Join:</strong> Session code{' '}
            <code className="bg-green-100 px-2 py-1 rounded font-mono font-semibold">
              {code}
            </code>{' '}
            has been auto-filled. Just enter your name to join!
          </p>
        </div>

        <JoinSessionForm
          onJoinSuccess={handleJoinSuccess}
          initialJoinCode={code}
        />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Wrong session?{' '}
            <a
              href="/join"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Enter a different code
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/join/$code')({
  component: JoinWithCodePage,
})
