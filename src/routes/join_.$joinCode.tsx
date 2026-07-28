import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { JoinSessionForm } from '../components/JoinSessionForm'
import { sessionService } from '../lib/api/services'
import { sessionKeys } from '../lib/api/hooks/use-session'
import { useCurrentGm } from '../lib/api/hooks/use-current-gm'
import LoadingSkeleton from '../components/LoadingSkeleton'
import type { Session } from '../lib/api/types'

function AutoJoinPage() {
  const { joinCode } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: currentGm } = useCurrentGm()

  // Fetch session details using join code
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['session', 'join', joinCode],
    queryFn: async () => {
      const response = await sessionService.findByJoinCode(joinCode)
      return response
    },
    retry: 1,
  })

  // A signed-in host opening their own session's join link should NOT re-join
  // as a new anonymous player (that's the "showing up twice" bug). Send them
  // straight into the session as host.
  const isHostOfSession = Boolean(
    currentGm?.id && session?.host?.id && currentGm.id === session.host.id,
  )
  useEffect(() => {
    if (isHostOfSession && session) {
      navigate({
        to: '/sessions/$id',
        params: { id: session.id },
        replace: true,
      })
    }
  }, [isHostOfSession, session, navigate])

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6">
            <LoadingSkeleton count={3} />
            <p className="text-center text-gray-600 mt-4">
              Loading session details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state - invalid join code
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Invalid Session Link
              </h2>
              <p className="text-gray-600 mb-4">
                This session link is invalid or has expired.
              </p>
            </div>

            {/* Show join form as fallback */}
            <JoinSessionForm
              onJoinSuccess={handleJoinSuccess}
              initialJoinCode={joinCode}
            />

            <div className="text-center mt-6">
              <a
                href="/sessions"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse active sessions
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Host opening their own link: redirecting to the session (see effect above).
  if (isHostOfSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Opening your session…</p>
          </div>
        </div>
      </div>
    )
  }

  // Success state - show session preview with join form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Session Preview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Game Night
            </h2>
            <p className="text-gray-600">You've been invited to join</p>
          </div>

          {/* Session Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {session.name}
            </h3>
            {session.description && (
              <p className="text-sm text-gray-600 mb-2">
                {session.description}
              </p>
            )}
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Host: {session.host.name}
            </div>
            {session.location && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {session.location}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(session.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Join Form */}
        <JoinSessionForm
          onJoinSuccess={handleJoinSuccess}
          initialJoinCode={joinCode}
          sessionPreview={session}
        />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Looking for a different session?{' '}
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

export const Route = createFileRoute('/join_/$joinCode')({
  component: AutoJoinPage,
})
