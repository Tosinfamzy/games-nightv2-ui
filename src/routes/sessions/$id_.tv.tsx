import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useSession, useSessionGames } from '../../lib/api/hooks/use-session'
import { useGameControl } from '../../hooks/useGameControl'
import { useGameScoring } from '../../hooks/useGameScoring'
import { useGameSocket } from '../../lib/socket/use-game-socket'

export const Route = createFileRoute('/sessions/$id_/tv')({
  validateSearch: (search: Record<string, unknown>): { gameId?: string } => ({
    gameId: typeof search.gameId === 'string' ? search.gameId : undefined,
  }),
  component: TvScoreboardPage,
})

const ACTIVE_STATUSES = ['in_progress', 'round_in_progress', 'paused']

const MEDAL = ['🥇', '🥈', '🥉']

function FullscreenButton() {
  const [fs, setFs] = useState(false)
  const toggle = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      setFs(false)
    } else {
      void document.documentElement.requestFullscreen?.()
      setFs(true)
    }
  }
  return (
    <button
      onClick={toggle}
      className="text-slate-400 hover:text-white text-sm border border-slate-600 rounded px-3 py-1"
      title="Toggle fullscreen"
    >
      {fs ? 'Exit full screen' : '⛶ Full screen'}
    </button>
  )
}

function TvScoreboardPage() {
  const { id } = Route.useParams()
  const { gameId: gameIdParam } = Route.useSearch()

  const { data: session } = useSession(id)
  const { data: games = [] } = useSessionGames(id)

  // Pick the game to show: explicit param, else the active game, else the most
  // recent non-completed one, else the last game.
  const activeGame =
    games.find((g) => g.id === gameIdParam) ??
    games.find((g) =>
      ACTIVE_STATUSES.includes(String(g.status).toLowerCase()),
    ) ??
    games.find((g) => String(g.status).toLowerCase() !== 'completed') ??
    games[games.length - 1]
  const gameId = activeGame?.id

  useGameSocket(gameId)
  const { game } = useGameControl(gameId)
  const { leaderboard } = useGameScoring(gameId)

  const joinCode = session?.joinCode ?? ''
  const joinUrl = joinCode ? `${window.location.origin}/join/${joinCode}` : ''
  const teams = game?.teams ?? []

  // Always show every team — overlay leaderboard points onto the full team list
  // so 0-point teams stay on the board, then sort by points.
  const pointsByTeam = new Map(leaderboard.map((r) => [r.teamId, r]))
  const rows = teams
    .map((t) => {
      const scored = pointsByTeam.get(t.id)
      return {
        teamId: t.id,
        teamName: t.name,
        totalPoints: scored?.totalPoints ?? 0,
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((r, i, arr) => ({
      ...r,
      rank: i + 1,
      isTied: i > 0 && arr[i - 1].totalPoints === r.totalPoints,
    }))
  const maxPoints = Math.max(1, rows[0]?.totalPoints ?? 1)
  const currentTurnTeam = teams.find((t) => t.id === game?.currentTurnTeamId)

  return (
    // Full-bleed: cover the app chrome so the TV shows only the scoreboard.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="px-6 sm:px-10 pt-6 pb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-slate-400 text-lg sm:text-2xl truncate">
            {session?.name ?? 'Games Night'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight truncate">
            {game?.name ?? 'Waiting to start…'}
          </h1>
        </div>
        <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
          {game && (
            <p className="text-xl sm:text-3xl font-semibold text-slate-200">
              Round {game.currentRound}
              <span className="text-slate-500">/{game.maxRounds}</span>
            </p>
          )}
          <span className="inline-flex items-center gap-2 text-emerald-400 text-sm sm:text-base font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <FullscreenButton />
        </div>
      </header>

      {/* Whose turn */}
      {currentTurnTeam && (
        <div className="mx-6 sm:mx-10 mb-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <span className="text-slate-300 text-lg sm:text-xl">Now up:</span>
          <span className="text-2xl sm:text-3xl font-bold text-indigo-200">
            {currentTurnTeam.name}
          </span>
        </div>
      )}

      {/* Leaderboard */}
      <main className="flex-1 px-6 sm:px-10 py-4 flex flex-col justify-center gap-3 sm:gap-4">
        {rows.length === 0 ? (
          <div className="text-center text-slate-400 text-2xl sm:text-4xl">
            Teams will appear here once the game starts
          </div>
        ) : (
          rows.map((row, i) => {
            const pct = Math.max(4, (row.totalPoints / maxPoints) * 100)
            const leader = i === 0 && row.totalPoints > 0
            return (
              <div
                key={row.teamId}
                className={`relative overflow-hidden rounded-2xl border ${
                  leader
                    ? 'border-yellow-400/60 bg-yellow-400/5'
                    : 'border-slate-700 bg-slate-800/40'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 ${leader ? 'bg-yellow-400/15' : 'bg-indigo-500/10'}`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="text-3xl sm:text-5xl font-black w-12 sm:w-16 text-center">
                      {MEDAL[i] ?? `${row.rank}`}
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold truncate">
                      {row.teamName}
                      {row.isTied && (
                        <span className="ml-3 text-xs sm:text-sm align-middle bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                          TIED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-4xl sm:text-6xl font-black tabular-nums flex-shrink-0">
                    {row.totalPoints}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Bottom bar: join */}
      <footer className="px-6 sm:px-10 py-5 bg-black/40 border-t border-slate-800 flex items-center justify-between gap-4">
        {joinUrl ? (
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="bg-white p-2 rounded-lg">
              <QRCode value={joinUrl} size={84} />
            </div>
            <div>
              <p className="text-slate-400 text-sm sm:text-lg">Scan to join</p>
              <p className="text-3xl sm:text-5xl font-mono font-bold tracking-[0.2em]">
                {joinCode}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">No join code</div>
        )}
        <div className="text-right text-slate-400 text-sm sm:text-lg">
          {rows.length} team{rows.length === 1 ? '' : 's'} playing
        </div>
      </footer>
    </div>
  )
}
