import { useState } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { ConfirmDialog } from '../ConfirmDialog'
import {
  canEndRound as canEndRoundOf,
  canStartFirstRound as canStartFirstRoundOf,
  canStartNextRound as canStartNextRoundOf,
  isFinalRound,
  isNotStarted,
} from '../../lib/game-status'
import { GameStatus } from '../../lib/api/types'
import type { UUID } from '../../lib/api/types'

interface RoundManagerProps {
  gameId: UUID
  className?: string
}

export default function RoundManager({
  gameId,
  className = '',
}: RoundManagerProps) {
  const [showFinalRoundConfirm, setShowFinalRoundConfirm] = useState(false)
  const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false)
  const {
    game,
    isLoading,
    startFirstRound,
    nextRound,
    endRound,
    isStartingRound,
    isAdvancingRound,
    isEndingRound,
  } = useGameControl(gameId)

  if (isLoading) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!game) {
    return null
  }

  const notStarted = isNotStarted(game.status)
  const roundLive = game.status === GameStatus.ROUND_IN_PROGRESS
  const roundEnded = game.status === GameStatus.ROUND_ENDED
  const canStartFirstRound = canStartFirstRoundOf(game)
  const canStartNextRound = canStartNextRoundOf(game)
  const canEndRound = canEndRoundOf(game)
  const isLastRound = isFinalRound(game)
  const roundProgress =
    game.maxRounds > 0 ? (game.currentRound / game.maxRounds) * 100 : 0

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Round Management
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              Round {game.currentRound}
              <span className="text-gray-500 text-2xl">
                {' '}
                / {game.maxRounds}
              </span>
            </div>
            {isLastRound && roundLive && (
              <div className="text-sm text-orange-600 font-medium mt-1">
                🏁 Final Round
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {Math.round(roundProgress)}%
            </div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              game.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${roundProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Start</span>
          {Array.from({ length: game.maxRounds - 1 }, (_, i) => i + 1).map(
            (round) => (
              <span
                key={round}
                className={
                  game.currentRound >= round ? 'text-blue-600 font-medium' : ''
                }
              >
                R{round}
              </span>
            ),
          )}
          <span>End</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {canStartFirstRound && (
          <button
            onClick={() => startFirstRound()}
            disabled={isStartingRound}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isStartingRound ? 'Starting Round 1...' : '🚀 Start Round 1'}
          </button>
        )}

        {canStartNextRound && (
          <button
            onClick={() => nextRound()}
            disabled={isAdvancingRound}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAdvancingRound
              ? 'Starting...'
              : `➡️ Start Round ${game.currentRound + 1}`}
          </button>
        )}

        {canEndRound && (
          <button
            onClick={() =>
              isLastRound
                ? setShowFinalRoundConfirm(true)
                : setShowEndRoundConfirm(true)
            }
            disabled={isEndingRound}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${
              isLastRound
                ? 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 py-2'
            }`}
          >
            {isEndingRound
              ? 'Ending Round...'
              : isLastRound
                ? '🏁 End Final Round & Complete Game'
                : '⏹ End Current Round'}
          </button>
        )}
      </div>

      {/* Status Info */}
      {notStarted && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            ℹ️ Start the game above, then start round 1 here.
          </p>
        </div>
      )}

      {canStartFirstRound && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            ▶ The game is running. Start round 1 to begin play.
          </p>
        </div>
      )}

      {roundLive && !isLastRound && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ Round {game.currentRound} in progress. Enter scores, then end the
            round. {game.maxRounds - game.currentRound}{' '}
            {game.maxRounds - game.currentRound === 1 ? 'round' : 'rounds'}{' '}
            remaining after this.
          </p>
        </div>
      )}

      {roundLive && isLastRound && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm font-medium">
            🏁 Final round in progress. Ending it completes the game.
          </p>
        </div>
      )}

      {roundEnded && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-800 text-sm">
            ⏹ Round {game.currentRound} ended. Start the next round when ready.
          </p>
        </div>
      )}

      {/* Final Round End Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showFinalRoundConfirm}
        onClose={() => setShowFinalRoundConfirm(false)}
        onConfirm={() => {
          endRound()
          setShowFinalRoundConfirm(false)
        }}
        title="End Final Round & Complete Game"
        message="This is the final round — ending it will complete the game and lock in the results. Make sure all scores are entered. Continue?"
        confirmLabel="End & Complete"
        variant="warning"
      />

      {/* End Round Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEndRoundConfirm}
        onClose={() => setShowEndRoundConfirm(false)}
        onConfirm={() => {
          endRound()
          setShowEndRoundConfirm(false)
        }}
        title="End Current Round"
        message={`Are you sure you want to end round ${game?.currentRound}? Make sure all scores are entered.`}
        confirmLabel="End Round"
        variant="warning"
      />
    </div>
  )
}
