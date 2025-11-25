import GameTimer from '../GameTimer'
import type { DashboardGame } from '../../lib/api/types'

interface GameProgressCardProps {
  game: DashboardGame
  sessionId: string
  className?: string
}

/**
 * Game progress card for GM Dashboard
 * Shows game status, round progress, current turn, and timer
 */
export default function GameProgressCard({
  game,
  className = '',
}: GameProgressCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'SCHEDULED':
      case 'NOT_STARTED':
        return 'bg-blue-100 text-blue-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isInProgress = game.status.toUpperCase() === 'IN_PROGRESS'
  const isCompleted = game.status.toUpperCase() === 'COMPLETED'

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Game Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{game.name}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Round {game.currentRound}/{game.maxRounds}
            </span>
            <span>•</span>
            <span>{game.teamsCount} teams</span>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(game.status)}`}
        >
          {game.status}
        </span>
      </div>

      {/* Current Turn Info (if in progress) */}
      {isInProgress && game.currentTurnTeamName && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">Current Turn</p>
          <p className="text-sm font-semibold text-blue-900">
            {game.currentTurnTeamName}
          </p>
        </div>
      )}

      {/* Timer (if game has timer configured and is in progress) */}
      {isInProgress && game.turnTimeLimit && game.turnTimeLimit > 0 && (
        <div className="mb-3">
          <GameTimer gameId={game.id} showTeamName={false} size="sm" />
        </div>
      )}

      {/* Winner Info (if completed) */}
      {isCompleted && game.winnerId && (
        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-xl">🏆</span>
            <div>
              <p className="text-xs text-yellow-600 font-medium">Winner</p>
              <p className="text-sm font-semibold text-yellow-900">
                Game Completed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round((game.currentRound / game.maxRounds) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{
              width: `${(game.currentRound / game.maxRounds) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
