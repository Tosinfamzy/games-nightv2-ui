import { useGameResults } from '../../lib/api/hooks/use-game'
import type { UUID } from '../../lib/api/types'

/**
 * Final standings for a completed game. Renders the winner (or a tie), the
 * winning score, and the full ranked table — replacing the old "check the
 * results" placeholder that pointed at a screen which never existed.
 */
export function GameResultsPanel({ gameId }: { gameId: UUID }) {
  const { data: results, isLoading, isError } = useGameResults(gameId)

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="h-5 w-40 bg-green-200/70 rounded animate-pulse" />
      </div>
    )
  }

  if (isError || !results) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm font-medium">
          🎉 Game completed! Final results aren’t available right now.
        </p>
      </div>
    )
  }

  const standings = [...results.standings].sort((a, b) => a.rank - b.rank)

  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-green-200 bg-green-100/60">
        <p className="text-green-900 font-semibold">
          {results.isTied
            ? '🤝 It’s a tie!'
            : results.winnerName
              ? `🏆 ${results.winnerName} wins!`
              : '🎉 Game completed'}
        </p>
        {!results.isTied && results.winningScore !== null && (
          <p className="text-green-800 text-sm mt-0.5">
            Winning score: {results.winningScore}
            {results.roundsCompleted > 0
              ? ` · ${results.roundsCompleted} round${
                  results.roundsCompleted > 1 ? 's' : ''
                }`
              : ''}
          </p>
        )}
      </div>

      <ul className="divide-y divide-green-100">
        {standings.map((team) => (
          <li
            key={team.teamId}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 text-gray-800">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-green-200 text-xs font-semibold text-gray-600">
                {team.rank}
              </span>
              <span className="font-medium">{team.teamName}</span>
              {team.isTied && (
                <span className="text-xs text-gray-400">(tied)</span>
              )}
            </span>
            <span className="font-semibold tabular-nums text-gray-900">
              {team.totalPoints}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
