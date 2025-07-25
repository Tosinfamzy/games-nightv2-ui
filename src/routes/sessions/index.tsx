import { createFileRoute } from '@tanstack/react-router'
import { useSessions } from '../../hooks/useSessions'

function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions()

  console.log('Sessions data:', sessions)
  console.log('Loading:', isLoading)
  console.log('Error:', error)

  if (isLoading) {
    return <div className="p-4">Loading sessions...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading sessions: {error.message}
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return <div className="p-4">No sessions found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Sessions</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          New Session
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{session.name}</h2>
            <p className="text-gray-600 mb-4">{session.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
              <button className="text-blue-500 hover:text-blue-600">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/sessions/')({
  component: SessionsPage,
})
