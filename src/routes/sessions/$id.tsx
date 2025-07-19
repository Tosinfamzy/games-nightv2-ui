import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '@/hooks/useSessions'

export const Route = createFileRoute('/sessions/$id')({
  component: SessionDetailsPage,
})

function SessionDetailsPage() {
  const { id } = Route.useParams()
  const { data: session, isLoading } = useSession(id)

  // Check if user just joined (for demo purposes)
  const justJoined =
    new URLSearchParams(window.location.search).get('joined') === 'true'

  if (isLoading) {
    return <div className="p-4">Loading session...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to the Session!
              </h1>
              <p className="text-gray-600 mb-6">
                You've successfully joined session{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🎯 What's Next?
                </h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Wait for the host to start the games</li>
                  <li>• You'll see live scores and updates here</li>
                  <li>• Team assignments will appear below</li>
                </ul>
              </div>

              <a
                href="/join"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Join Another Session
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{session.name}</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{session.description}</p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">{session.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
