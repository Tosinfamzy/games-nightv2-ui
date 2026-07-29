import { useState } from 'react'
import { useGameScores, useSubmitGameScore } from '../hooks/useScores'
import { toastHelpers } from '../lib/toast'
import type { SubmitGameScoreDTO } from '../lib/api/services/score.service'

interface LiveScoreboardProps {
  gameId: string
  teams: Array<{
    id: string
    name: string
    color?: string
  }>
  currentRound: number
  maxRounds: number
  gameStatus: string
  onGameStateChange?: (
    action: 'start' | 'end' | 'nextRound' | 'startFirstRound',
  ) => void
}

export function LiveScoreboard({
  gameId,
  teams,
  currentRound,
  maxRounds,
  gameStatus,
  onGameStateChange,
}: LiveScoreboardProps) {
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({})
  const [showScoreInput, setShowScoreInput] = useState(false)

  const { data: teamScores = [], isLoading } = useGameScores(gameId)
  const submitScoreMutation = useSubmitGameScore()

  const handleScoreInputChange = (teamId: string, value: string) => {
    setScoreInputs((prev) => ({ ...prev, [teamId]: value }))
  }

  const handleSubmitScore = (teamId: string) => {
    const scoreValue = scoreInputs[teamId]
    if (!scoreValue || isNaN(Number(scoreValue))) return

    const scoreData: SubmitGameScoreDTO = {
      teamId,
      score: Number(scoreValue),
      roundNumber: currentRound,
    }

    submitScoreMutation.mutate(
      { gameId, data: scoreData },
      {
        onSuccess: () => {
          setScoreInputs((prev) => ({ ...prev, [teamId]: '' }))
        },
        onError: (error) => {
          toastHelpers.operationError('submit score', error)
        },
      },
    )
  }

  const getTeamScore = (teamId: string) => {
    return teamScores.find((score) => score.teamId === teamId)
  }

  const sortedTeams = teams
    .map((team) => ({
      ...team,
      score: getTeamScore(team.id),
    }))
    .sort((a, b) => (b.score?.totalPoints || 0) - (a.score?.totalPoints || 0))

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Live Scoreboard</h2>
            <p className="text-gray-600">
              Round {currentRound} of {maxRounds}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                gameStatus === 'IN_PROGRESS' ||
                gameStatus === 'ROUND_IN_PROGRESS'
                  ? 'bg-green-100 text-green-800'
                  : gameStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {gameStatus}
            </span>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-3">
          {gameStatus === 'PENDING' && (
            <button
              onClick={() => onGameStateChange?.('start')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Start Game
            </button>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() => onGameStateChange?.('startFirstRound')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Start First Round
              </button>
            </>
          )}

          {gameStatus === 'ROUND_IN_PROGRESS' && (
            <>
              <button
                onClick={() => setShowScoreInput(!showScoreInput)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {showScoreInput ? 'Hide Score Input' : 'Add Scores'}
              </button>

              {currentRound < maxRounds && (
                <button
                  onClick={() => onGameStateChange?.('nextRound')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Next Round
                </button>
              )}

              <button
                onClick={() => onGameStateChange?.('end')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                End Game
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h3 className="text-lg font-semibold">Team Standings</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedTeams.map((team, index) => {
            const teamScore = team.score
            return (
              <div
                key={team.id}
                className="p-6 flex items-center justify-between"
                style={{ borderLeftColor: team.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{team.name}</h4>
                    <div className="flex items-center gap-2">
                      {team.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                      )}
                      <span className="text-sm text-gray-600">
                        {teamScore?.bonusPointsCount || 0} bonus points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {teamScore?.totalPoints || 0}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Score Input Panel — scores are only enterable during a live round,
          matching the "Add Scores" toggle above (previously gated on
          IN_PROGRESS, which the toggle never shows, so it was unreachable). */}
      {showScoreInput && gameStatus === 'ROUND_IN_PROGRESS' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Add Scores for Round {currentRound}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="border border-gray-200 rounded-lg p-4"
                style={{ borderLeftColor: team.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{team.name}</h4>
                  <div className="text-sm text-gray-600">
                    Current: {getTeamScore(team.id)?.totalPoints || 0}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter points"
                    value={scoreInputs[team.id] || ''}
                    onChange={(e) =>
                      handleScoreInputChange(team.id, e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSubmitScore(team.id)}
                    disabled={
                      !scoreInputs[team.id] || submitScoreMutation.isPending
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round-by-Round Breakdown */}
      {teamScores.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Round-by-Round Scores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Team</th>
                  {Array.from({ length: maxRounds }, (_, i) => (
                    <th key={i} className="text-center py-2 px-3">
                      R{i + 1}
                    </th>
                  ))}
                  <th className="text-center py-2 px-3 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team) => {
                  const teamScore = team.score
                  return (
                    <tr key={team.id} className="border-b">
                      <td className="py-2 font-medium">{team.name}</td>
                      {Array.from({ length: maxRounds }, (_, i) => (
                        <td key={i} className="text-center py-2 px-3">
                          {teamScore?.roundPoints[i + 1] || '-'}
                        </td>
                      ))}
                      <td className="text-center py-2 px-3 font-bold">
                        {teamScore?.totalPoints || 0}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
