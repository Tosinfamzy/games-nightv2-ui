import { Link, createFileRoute } from '@tanstack/react-router'
import { HostOnly } from '../../components/HostOnly'
import { NightBuilder } from '../../components/night-builder/NightBuilder'
import { useSessionFull } from '../../lib/api/hooks/use-session'
import { useCurrentGm } from '../../lib/api/hooks/use-current-gm'
import { SessionStatus } from '../../lib/api/types/session'

export const Route = createFileRoute('/sessions/$id_/builder')({
  component: BuilderPage,
})

function BackLink({ sessionId }: { sessionId: string }) {
  return (
    <Link
      to="/sessions/$id"
      params={{ id: sessionId }}
      className="mb-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      ← Back to session
    </Link>
  )
}

function Notice({
  sessionId,
  title,
  children,
}: {
  sessionId: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <BackLink sessionId={sessionId} />
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{children}</p>
    </div>
  )
}

function BuilderPage() {
  return (
    <HostOnly title="Plan the night">
      <BuilderContent />
    </HostOnly>
  )
}

function BuilderContent() {
  const { id } = Route.useParams()
  const { session, games, teams, players, isLoading } = useSessionFull(id)
  const { data: currentGm } = useCurrentGm()

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading the session…</div>
    )
  }

  if (!session) {
    return (
      <Notice sessionId={id} title="Session not found">
        We couldn&apos;t find this session.
      </Notice>
    )
  }

  const isHost = Boolean(
    currentGm?.id && session.host.id && currentGm.id === session.host.id,
  )
  if (!isHost) {
    return (
      <Notice sessionId={id} title="Only the host can plan">
        This is the host&apos;s planning tool for their own games night.
      </Notice>
    )
  }

  if (session.status !== SessionStatus.SCHEDULED) {
    return (
      <Notice sessionId={id} title="Planning is for scheduled sessions">
        This session is {session.status.toLowerCase().replace('_', ' ')}. You
        can plan the night before it starts.
      </Notice>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-4 max-w-2xl">
          <BackLink sessionId={id} />
          <h1 className="text-2xl font-bold text-gray-900">Plan the night</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pick games, set rounds and teams, and push it all into{' '}
            <span className="font-medium">{session.name}</span>.
          </p>
        </div>

        <NightBuilder
          sessionId={id}
          defaultPlayerCount={players.length > 0 ? players.length : 12}
          hasExistingLineup={games.length > 0 || teams.length > 0}
        />
      </div>
    </div>
  )
}
