import { useState } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { useGameScoring } from '../../hooks/useGameScoring'
import type { UUID } from '../../lib/api/types'

interface LiveScoreEntryProps {
  gameId: UUID
  className?: string
}

export default function LiveScoreEntry({
  gameId,
  className = '',
}: LiveScoreEntryProps) {
  const { game, isLoading: isLoadingGame } = useGameControl(gameId)
  const { submitScore, isSubmittingScore } = useGameScoring(gameId)
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

  const handleScoreChange = (teamId: string, value: string) => {
    // Allow only numbers and negative sign
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setScoreInputs((prev) => ({ ...prev, [teamId]: value }))
    }
  }

  const handleSubmitScore = (teamId: string) => {
    const scoreValue = scoreInputs[teamId]
    if (!scoreValue || scoreValue === '-') return

    const points = parseInt(scoreValue, 10)
    if (isNaN(points)) return

    submitScore({
      gameId,
      teamId,
      score: points,
      roundNumber: game.currentRound,
    })

    // Clear the input after submission
    setScoreInputs((prev) => ({ ...prev, [teamId]: '' }))
  }

  const handleKeyPress = (teamId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitScore(teamId)
    }
  }

  if (game.teams.length === 0) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📝 Quick Score Entry
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>No teams found</p>
          <p className="text-sm mt-1">Add teams to start scoring</p>
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
          Round {game.currentRound} of {game.maxRounds}
        </p>
      </div>

      {/* Score Input for Each Team */}
      <div className="space-y-3">
        {game.teams.map((team) => {
          const inputValue = scoreInputs[team.id] || ''
          const hasValue = inputValue && inputValue !== '-'

          return (
            <div
              key={team.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Team Info */}
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{team.name}</div>
                  <div className="text-xs text-gray-600">
                    {team.playerIds.length} player
                    {team.playerIds.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Score Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) => handleScoreChange(team.id, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(team.id, e)}
                    placeholder="0"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmittingScore}
                  />

                  {/* Submit Button */}
                  <button
                    onClick={() => handleSubmitScore(team.id)}
                    disabled={!hasValue || isSubmittingScore}
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
