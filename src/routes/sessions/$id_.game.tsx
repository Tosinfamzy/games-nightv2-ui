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
import { useCurrentGm } from '../../lib/api/hooks/use-current-gm'
import { useHostRealtimeToken } from '../../hooks/useHostRealtimeToken'
import { usePlayer } from '../../contexts/PlayerContext'

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
  const { data: currentGm } = useCurrentGm()
  const isHost = Boolean(
    currentGm?.id && session?.host.id && currentGm.id === session.host.id,
  )

  // A Clerk-only host (no player token in this browser) otherwise gets no live
  // updates on their own control panel / TV board — mint a host token so the
  // sockets connect.
  useHostRealtimeToken(id)

  const { game, isLoading } = useGameControl(gameId)

  // Which team the current player is on — so the "it's your turn" alert only
  // fires for them (everyone else gets a subtle "now playing").
  const { player } = usePlayer()
  const myTeamId =
    player?.id != null
      ? game?.teams?.find((t) => t.playerIds?.includes(player.id))?.id
      : undefined

  // Real-time game-room updates (notifications + error toasts); the control and
  // scoring components self-subscribe for their own data.
  useGameSocket(gameId, { currentTeamId: myTeamId })

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
              <GameControlPanel gameId={gameId} sessionId={id} />
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
