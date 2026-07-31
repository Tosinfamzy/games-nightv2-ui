import { useState } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { useGameScoring } from '../../hooks/useGameScoring'
import { useSessionPlayers } from '../../lib/api/hooks/use-session'
import { isRoundLive } from '../../lib/game-status'
import type { UUID } from '../../lib/api/types'

interface LiveScoreEntryProps {
  gameId: UUID
  className?: string
}

interface Entrant {
  id: string
  name: string
  subtitle?: string
}

export default function LiveScoreEntry({
  gameId,
  className = '',
}: LiveScoreEntryProps) {
  const { game, isLoading: isLoadingGame } = useGameControl(gameId)
  const { submitScore, isSubmittingScore } = useGameScoring(gameId)
  // Only used in individual mode; the hook no-ops on an empty session id.
  const { data: players = [] } = useSessionPlayers(game?.sessionId ?? '')
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({})

  if (isLoadingGame) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!game) {
    return null
  }

  // Scores are only accepted during a live round (backend rejects otherwise),
  // so don't present an active entry form outside ROUND_IN_PROGRESS.
  if (!isRoundLive(game.status)) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">Score entry</h3>
        <p className="text-sm text-gray-600">
          Start a round to enter scores. Points can only be recorded while a
          round is in progress.
        </p>
      </div>
    )
  }

  const isIndividual = game.scoreMode === 'individual'

  const entrants: Array<Entrant> = isIndividual
    ? players.map((player) => ({ id: player.id, name: player.name }))
    : (game.teams ?? []).map((team) => ({
        id: team.id,
        name: team.name,
        subtitle: `${team.playerIds.length} player${
          team.playerIds.length !== 1 ? 's' : ''
        }`,
      }))

  const handleScoreChange = (entrantId: string, value: string) => {
    // Allow only numbers and negative sign
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setScoreInputs((prev) => ({ ...prev, [entrantId]: value }))
    }
  }

  const handleSubmitScore = (entrantId: string) => {
    const scoreValue = scoreInputs[entrantId]
    if (!scoreValue || scoreValue === '-') return

    const points = parseInt(scoreValue, 10)
    if (isNaN(points)) return

    submitScore({
      gameId,
      ...(isIndividual ? { playerId: entrantId } : { teamId: entrantId }),
      score: points,
      roundNumber: game.currentRound,
    })

    // Clear the input after submission
    setScoreInputs((prev) => ({ ...prev, [entrantId]: '' }))
  }

  const handleKeyPress = (entrantId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitScore(entrantId)
    }
  }

  if (entrants.length === 0) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📝 Quick Score Entry
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>{isIndividual ? 'No players found' : 'No teams found'}</p>
          <p className="text-sm mt-1">
            {isIndividual
              ? 'Add players to the session to start scoring'
              : 'Add teams to start scoring'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          📝 Quick Score Entry
        </h3>
        <p className="text-sm text-gray-600">
          {isIndividual ? 'Scoring by player' : 'Scoring by team'} · Round{' '}
          {game.currentRound} of {game.maxRounds}
        </p>
      </div>

      {/* Score Input for Each Entrant */}
      <div className="space-y-3">
        {entrants.map((entrant) => {
          const inputValue = scoreInputs[entrant.id] || ''
          const hasValue = inputValue && inputValue !== '-'

          return (
            <div
              key={entrant.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Entrant Info */}
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{entrant.name}</div>
                  {entrant.subtitle && (
                    <div className="text-xs text-gray-600">
                      {entrant.subtitle}
                    </div>
                  )}
                </div>

                {/* Score Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) =>
                      handleScoreChange(entrant.id, e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(entrant.id, e)}
                    placeholder="0"
                    aria-label={`Score for ${entrant.name}`}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmittingScore}
                  />

                  {/* Submit Button */}
                  <button
                    onClick={() => handleSubmitScore(entrant.id)}
                    disabled={!hasValue || isSubmittingScore}
                    aria-label={`Submit score for ${entrant.name}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmittingScore ? '...' : '✓'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div>💡 Tip: Enter score and press Enter to submit quickly</div>
          <div>➕ Positive numbers add points, negative numbers subtract</div>
        </div>
      </div>
    </div>
  )
}
