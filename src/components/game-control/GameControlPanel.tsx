import { useState } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { ConfirmDialog } from '../ConfirmDialog'
import type { GameStatus, UUID } from '../../lib/api/types'

interface GameControlPanelProps {
  gameId: UUID
  className?: string
}

export default function GameControlPanel({
  gameId,
  className = '',
}: GameControlPanelProps) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const {
    game,
    isLoading,
    pauseGame,
    resumeGame,
    completeGame,
    isPausing,
    isResuming,
    isCompleting,
  } = useGameControl(gameId)

  if (isLoading) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <p className="text-gray-500">Game not found</p>
      </div>
    )
  }

  const getStatusColor = (status: GameStatus): string => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'NOT_STARTED':
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const canPause = game.status === 'IN_PROGRESS'
  const canResume = game.status === 'PAUSED'
  const canComplete =
    game.status === 'IN_PROGRESS' && game.currentRound === game.maxRounds

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{game.name}</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              game.status,
            )}`}
          >
            {game.status.replace('_', ' ')}
          </span>
        </div>
        {game.description && (
          <p className="text-gray-600 text-sm">{game.description}</p>
        )}
      </div>

      {/* Game Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Current Round</div>
          <div className="text-2xl font-bold text-gray-900">
            {game.currentRound} / {game.maxRounds}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Teams</div>
          <div className="text-2xl font-bold text-gray-900">
            {game.teams.length}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Players</div>
          <div className="text-2xl font-bold text-gray-900">
            {game.teams.reduce(
              (total, team) => total + team.playerIds.length,
              0,
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Progress</div>
          <div className="text-2xl font-bold text-gray-900">
            {game.maxRounds > 0
              ? Math.round((game.currentRound / game.maxRounds) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {canPause && (
          <button
            onClick={() => pauseGame()}
            disabled={isPausing}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPausing ? 'Pausing...' : '⏸ Pause Game'}
          </button>
        )}

        {canResume && (
          <button
            onClick={() => resumeGame()}
            disabled={isResuming}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isResuming ? 'Resuming...' : '▶ Resume Game'}
          </button>
        )}

        {canComplete && (
          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={isCompleting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isCompleting ? 'Completing...' : '🏁 Complete Game'}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {game.status === 'NOT_STARTED' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            ℹ️ Game not started yet. Start the first round to begin playing.
          </p>
        </div>
      )}

      {game.status === 'PAUSED' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⏸ Game is paused. Resume when ready to continue.
          </p>
        </div>
      )}

      {game.status === 'COMPLETED' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">
            🎉 Game completed! Check the results to see who won.
          </p>
        </div>
      )}

      {/* Complete Game Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={() => {
          completeGame()
          setShowCompleteConfirm(false)
        }}
        title="Complete Game"
        message="Are you sure you want to complete this game? This action cannot be undone."
        confirmLabel="Complete Game"
        variant="warning"
      />
    </div>
  )
}
