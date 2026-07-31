import { useState } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { useSessionTeams } from '../../lib/api/hooks/use-session'
import { ConfirmDialog } from '../ConfirmDialog'
import {
  canComplete as canCompleteGame,
  canPause as canPauseGame,
  canResume as canResumeGame,
  canStartGame,
  isNotStarted,
  prettyStatus,
} from '../../lib/game-status'
import { GameStatus } from '../../lib/api/types'
import { GameResultsPanel } from './GameResultsPanel'
import type { UUID } from '../../lib/api/types'

interface GameControlPanelProps {
  gameId: UUID
  /** Session the game belongs to — used to gather teams when starting. */
  sessionId: UUID
  className?: string
}

export default function GameControlPanel({
  gameId,
  sessionId,
  className = '',
}: GameControlPanelProps) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const {
    game,
    isLoading,
    startGame,
    pauseGame,
    resumeGame,
    completeGame,
    isStarting,
    isPausing,
    isResuming,
    isCompleting,
  } = useGameControl(gameId)
  const { data: sessionTeams = [] } = useSessionTeams(sessionId)

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
      case GameStatus.IN_PROGRESS:
      case GameStatus.ROUND_IN_PROGRESS:
        return 'bg-green-100 text-green-800'
      case GameStatus.ROUND_ENDED:
        return 'bg-indigo-100 text-indigo-800'
      case GameStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800'
      case GameStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800'
      case GameStatus.CANCELLED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const teams = game.teams ?? []
  const showStart = canStartGame(game)
  const showPause = canPauseGame(game)
  const showResume = canResumeGame(game)
  const showComplete = canCompleteGame(game)
  const enoughTeams = sessionTeams.length >= 2

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
            {prettyStatus(game.status)}
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
          <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Players</div>
          <div className="text-2xl font-bold text-gray-900">
            {teams.reduce((total, team) => total + team.playerIds.length, 0)}
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
        {showStart && (
          <button
            onClick={() => startGame(sessionTeams.map((t) => t.id))}
            disabled={isStarting || !enoughTeams}
            title={enoughTeams ? undefined : 'Form at least two teams to start'}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isStarting ? 'Starting…' : '🎮 Start Game'}
          </button>
        )}

        {showPause && (
          <button
            onClick={() => pauseGame()}
            disabled={isPausing}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPausing ? 'Pausing...' : '⏸ Pause Game'}
          </button>
        )}

        {showResume && (
          <button
            onClick={() => resumeGame()}
            disabled={isResuming}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isResuming ? 'Resuming...' : '▶ Resume Game'}
          </button>
        )}

        {showComplete && (
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
      {isNotStarted(game.status) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            {enoughTeams
              ? 'ℹ️ Ready to go. Start the game, then start round 1 below.'
              : '⚠️ Form at least two teams in the session before starting this game.'}
          </p>
        </div>
      )}

      {game.status === GameStatus.PAUSED && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⏸ Game is paused. Resume when ready to continue.
          </p>
        </div>
      )}

      {game.status === GameStatus.COMPLETED && (
        <GameResultsPanel gameId={gameId} />
      )}

      {game.status === GameStatus.CANCELLED && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">This game was cancelled.</p>
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
