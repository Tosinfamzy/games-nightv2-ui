import { Link, createFileRoute } from '@tanstack/react-router'
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useMySessions } from '../../lib/api/hooks/use-my-sessions'
import { QueryErrorDisplay } from '../../components/QueryErrorDisplay'
import EmptyState from '../../components/EmptyState'

function SessionsPage() {
  return (
    <>
      {/* The session list is a host view — scoped to your own sessions. */}
      <SignedOut>
        <SignInPrompt />
      </SignedOut>
      <SignedIn>
        <MySessionsList />
      </SignedIn>
    </>
  )
}

function SignInPrompt() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center mt-8">
        <h1 className="text-2xl font-bold mb-2">Your sessions</h1>
        <p className="text-gray-600 mb-6">
          Sign in as a games master to view and manage the sessions you host.
          Looking to play? Use a join code or the invite link from your host.
        </p>
        <SignInButton mode="modal">
          <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 font-medium">
            Sign in
          </button>
        </SignInButton>
      </div>
    </div>
  )
}

function MySessionsList() {
  const { data: sessions, isLoading, error } = useMySessions()

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
    return (
      <div className="container mx-auto p-4">
        <EmptyState
          icon={
            <svg
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          title="No game sessions yet"
          description="Create your first session to start organizing game nights with your friends."
          action={{
            label: 'Create Session',
            onClick: () => {
              window.location.href = '/sessions/new'
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Game Sessions</h1>
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
