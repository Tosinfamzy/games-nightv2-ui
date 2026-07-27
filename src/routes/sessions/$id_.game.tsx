import { Link, createFileRoute } from '@tanstack/react-router'
import {
  GameControlPanel,
  LiveLeaderboard,
  LiveScoreEntry,
  RoundManager,
  RoundScorecard,
  TurnController,
} from '../../components/game-control'
import GameTimer from '../../components/GameTimer'
import { useGameControl } from '../../hooks/useGameControl'
import { useGameSocket } from '../../lib/socket/use-game-socket'
import { useSession } from '../../lib/api/hooks/use-session'
import { useGamesMasterContext } from '../../contexts/GamesMasterContext'

export const Route = createFileRoute('/sessions/$id_/game')({
  validateSearch: (search: Record<string, unknown>): { gameId: string } => ({
    gameId: typeof search.gameId === 'string' ? search.gameId : '',
  }),
  component: InSessionGamePage,
})

function BackLink({ sessionId }: { sessionId: string }) {
  return (
    <Link
      to="/sessions/$id"
      params={{ id: sessionId }}
      className="text-blue-600 hover:text-blue-700 inline-flex items-center mb-3 text-sm font-medium"
    >
      ← Back to session
    </Link>
  )
}

function InSessionGamePage() {
  const { id } = Route.useParams()
  const { gameId } = Route.useSearch()

  const { data: session } = useSession(id)
  const { gm } = useGamesMasterContext()
  const isHost = Boolean(
    gm?.id && session?.host.id && gm.id === session.host.id,
  )

  // Real-time game-room updates (notifications + error toasts); the control and
  // scoring components self-subscribe for their own data.
  useGameSocket(gameId)
  const { game, isLoading } = useGameControl(gameId)

  if (!gameId) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <BackLink sessionId={id} />
        <h1 className="text-xl font-bold text-gray-900">No game selected</h1>
        <p className="text-gray-500 mt-2">
          Pick a game from the session's Games tab to play.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-5">
          <BackLink sessionId={id} />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isLoading ? 'Loading game…' : (game?.name ?? 'Game')}
            </h1>
            <div className="flex items-center gap-3">
              {session && (
                <span className="text-sm text-gray-500">{session.name}</span>
              )}
              {isHost && (
                <Link
                  to="/sessions/$id/tv"
                  params={{ id }}
                  search={{ gameId }}
                  target="_blank"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5"
                  title="Open the big-screen scoreboard on a TV or projector"
                >
                  📺 TV view
                </Link>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            {isHost
              ? 'Run the game: control rounds, turns, and scoring — everyone sees it live.'
              : 'Live game view — updates automatically as the host plays.'}
          </p>
        </div>

        {isHost ? (
          /* HOST — full control layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GameControlPanel gameId={gameId} />
              <RoundManager gameId={gameId} />
              <TurnController gameId={gameId} />
              <LiveScoreEntry gameId={gameId} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <GameTimer gameId={gameId} />
                <LiveLeaderboard gameId={gameId} showRoundBreakdown />
              </div>
            </div>
          </div>
        ) : (
          /* PLAYER — read-only live view (mobile-first) */
          <div className="max-w-2xl mx-auto space-y-6">
            <GameTimer gameId={gameId} />
            <LiveLeaderboard gameId={gameId} showRoundBreakdown />
            <RoundScorecard gameId={gameId} />
          </div>
        )}
      </div>
    </div>
  )
}
