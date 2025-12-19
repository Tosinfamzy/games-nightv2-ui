import { useGameHistory } from '../hooks/useGameHistory'
import type { UUID } from '../lib/api/types'

interface GameHistoryListProps {
  sessionId?: UUID
}

export default function GameHistoryList({ sessionId }: GameHistoryListProps) {
  const { data: games, isLoading, error } = useGameHistory({ sessionId })

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading game history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Failed to load game history</p>
      </div>
    )
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg">No games played yet.</p>
        <p className="text-sm mt-2">Complete some games to see them here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div
          key={game.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {game.gameName}
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(game.completedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mb-3">
            {game.isTied ? (
              <p className="text-yellow-600 font-medium">Tie Game!</p>
            ) : (
              <p className="text-green-600 font-medium">
                Winner: {game.winningTeamName}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Duration: {game.durationMinutes} minutes • {game.totalRounds}{' '}
              {game.totalRounds === 1 ? 'round' : 'rounds'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Final Scores:</p>
            {game.finalScores
              .sort((a, b) => a.rank - b.rank)
              .map((score) => (
                <div
                  key={score.teamId}
                  className="flex justify-between text-sm py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500 font-mono w-6">
                      #{score.rank}
                    </span>
                    <span className="font-medium">{score.teamName}</span>
                  </span>
                  <span className="font-semibold text-blue-600">
                    {score.score}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
