import { Link, createFileRoute } from '@tanstack/react-router'
import { useSessions } from '../../hooks/useSessions'
import { QueryErrorDisplay } from '../../components/QueryErrorDisplay'

function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading sessions...</div>
  }

  if (error) {
    return (
      <QueryErrorDisplay
        error={
          error instanceof Error ? error : new Error('Failed to load sessions')
        }
        onRetry={() => window.location.reload()}
        backTo="/"
        showBackButton={false}
      />
    )
  }

  if (!sessions || sessions.length === 0) {
    return <div className="p-4">No sessions found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Sessions</h1>
        <Link
          to="/sessions/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 no-underline"
        >
          New Session
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{session.name}</h2>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  session.status,
                )}`}
              >
                {session.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{session.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <div>Host: {session.host?.name ?? 'Unknown Host'}</div>
              <div>
                Date:{' '}
                {new Date(
                  session.date || session.createdAt,
                ).toLocaleDateString()}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Created: {new Date(session.createdAt).toLocaleDateString()}
              </span>
              <Link
                to="/sessions/$id"
                params={{ id: session.id }}
                className="text-blue-500 hover:text-blue-600 no-underline"
              >
                View Details →
              </Link>
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
