import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { gameService } from '../lib/api/services/game.service'
import { scoreService, type TeamScore } from '../lib/api/services/score.service'
import { ConfirmDialog } from './ConfirmDialog'
import type { Game } from '../lib/api/types'
import GameTimer from './GameTimer'
import TimerControls from './TimerControls'
import { useGameSocket } from '../lib/socket'
import { toastHelpers } from '../lib/toast'

interface LiveGameViewProps {
  sessionId: string
  game: Game
  onEndGame: () => void
  onBackToGameSelect: () => void
}

export function LiveGameView({
  sessionId,
  game,
  onEndGame,
  onBackToGameSelect,
}: LiveGameViewProps) {
  const queryClient = useQueryClient()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [scoreValue, setScoreValue] = useState<number>(0)
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false)

  // Connect to game WebSocket for real-time updates (including timer)
  useGameSocket(game.id)

  // Fetch game details with teams
  const { data: gameDetails, isLoading: gameLoading } = useQuery({
    queryKey: ['games', game.id],
    queryFn: () => gameService.getById(game.id),
    refetchInterval: game.status === 'IN_PROGRESS' ? 5000 : false,
  })

  // Fetch scores for this game
  const { data: teamScoresData = [] } = useQuery({
    queryKey: ['scores', 'game', game.id],
    queryFn: () => scoreService.getGameScores(game.id),
    refetchInterval: gameDetails?.status === 'IN_PROGRESS' ? 5000 : false,
  })

  // Mutations
  const startGameMutation = useMutation({
    mutationFn: () => gameService.startFirstRound(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
    },
  })

  const nextRoundMutation = useMutation({
    mutationFn: () => gameService.nextRound(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
    },
  })

  const completeGameMutation = useMutation({
    mutationFn: () => gameService.complete(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
      onEndGame()
    },
  })

  const submitScoreMutation = useMutation({
    mutationFn: (data: {
      teamId: string
      roundNumber: number
      points: number
    }) =>
      scoreService.create({
        gameId: game.id,
        teamId: data.teamId,
        points: data.points,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', 'game', game.id] })
      setSelectedTeamId('')
      setScoreValue(0)
    },
  })

  const nextTurnMutation = useMutation({
    mutationFn: () => gameService.nextTurn(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
      toastHelpers.updated('Turn advanced', 'Next team is up!')
    },
    onError: (error) => {
      toastHelpers.operationError('advance turn', error)
    },
  })

  const pauseGameMutation = useMutation({
    mutationFn: () => gameService.pause(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
      toastHelpers.info('⏸️ Game paused')
    },
    onError: (error) => {
      toastHelpers.operationError('pause game', error)
    },
  })

  const resumeGameMutation = useMutation({
    mutationFn: () => gameService.resume(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games', game.id] })
      toastHelpers.info('▶️ Game resumed')
    },
    onError: (error) => {
      toastHelpers.operationError('resume game', error)
    },
  })

  const handleSubmitScore = () => {
    if (!selectedTeamId || !gameDetails?.currentRound) return

    submitScoreMutation.mutate({
      teamId: selectedTeamId,
      roundNumber: gameDetails.currentRound,
      points: scoreValue,
    })
  }

  if (gameLoading || !gameDetails) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading game...</div>
      </div>
    )
  }

  const teams = gameDetails.teams || []
  const currentRound = gameDetails.currentRound || 0
  const maxRounds = gameDetails.maxRounds || 0

  // Merge team data with scores
  const teamScores = teams.map((team) => {
    const teamScore = teamScoresData.find(
      (ts: TeamScore) => ts.teamId === team.id,
    )
    return {
      team,
      total: teamScore?.totalPoints || 0,
      roundPoints: teamScore?.roundPoints || {},
    }
  })

  // Sort by total score
  teamScores.sort((a, b) => b.total - a.total)

  const gameStatus = gameDetails.status.toUpperCase()

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{gameDetails.name}</h2>
            <p className="text-blue-100">
              {gameDetails.description || 'Now playing...'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Round</div>
            <div className="text-3xl font-bold">
              {currentRound} / {maxRounds}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex space-x-2">
          {gameStatus === 'SCHEDULED' && (
            <button
              onClick={() => startGameMutation.mutate()}
              disabled={startGameMutation.isPending || teams.length === 0}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50"
            >
              {startGameMutation.isPending ? 'Starting...' : 'Start Game'}
            </button>
          )}

          {gameStatus === 'IN_PROGRESS' && (
            <>
              {currentRound < maxRounds && (
                <button
                  onClick={() => nextRoundMutation.mutate()}
                  disabled={nextRoundMutation.isPending}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  Next Round
                </button>
              )}

              <button
                onClick={() => setShowEndGameConfirm(true)}
                disabled={completeGameMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
              >
                End Game
              </button>
            </>
          )}

          <button
            onClick={onBackToGameSelect}
            className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"
          >
            ← Back to Games
          </button>
        </div>
      </div>

      {/* Game Timer and Controls (if configured) */}
      {gameStatus === 'IN_PROGRESS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Display */}
          <div className="lg:col-span-2">
            <GameTimer gameId={game.id} showTeamName={true} size="md" />
          </div>

          {/* Timer Controls */}
          <div className="lg:col-span-1">
            <TimerControls
              gameId={game.id}
              onAdvanceTurn={() => nextTurnMutation.mutate()}
              onPauseTimer={() => pauseGameMutation.mutate()}
              onResumeTimer={() => resumeGameMutation.mutate()}
              disabled={
                nextTurnMutation.isPending ||
                pauseGameMutation.isPending ||
                resumeGameMutation.isPending
              }
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Input */}
        {gameStatus === 'IN_PROGRESS' && (
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Submit Score - Round {currentRound}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter points"
                />
              </div>

              <button
                onClick={handleSubmitScore}
                disabled={!selectedTeamId || submitScoreMutation.isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitScoreMutation.isPending
                  ? 'Submitting...'
                  : 'Submit Score'}
              </button>

              {submitScoreMutation.isError && (
                <p className="text-sm text-red-600">
                  Failed to submit score. Please try again.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live Scoreboard */}
        <div
          className={`${gameStatus === 'IN_PROGRESS' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-lg shadow-md p-6`}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Scoreboard</h3>

          {teams.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No teams assigned to this game yet.
            </div>
          ) : (
            <div className="space-y-4">
              {teamScores.map((ts, index) => (
                <div
                  key={ts.team.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-600' : 'text-gray-400'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ts.team.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Object.keys(ts.roundPoints).length} round
                        {Object.keys(ts.roundPoints).length !== 1
                          ? 's'
                          : ''}{' '}
                        scored
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {ts.total}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Round History */}
      {teamScoresData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Round History
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  {Array.from({ length: maxRounds }, (_, i) => i + 1).map(
                    (round) => (
                      <th
                        key={round}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        R{round}
                      </th>
                    ),
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamScores.map((ts) => (
                  <tr key={ts.team.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ts.team.name}
                    </td>
                    {Array.from({ length: maxRounds }, (_, i) => i + 1).map(
                      (round) => {
                        const points = ts.roundPoints[round.toString()]
                        return (
                          <td
                            key={round}
                            className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-700"
                          >
                            {points !== undefined ? points : '-'}
                          </td>
                        )
                      },
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-900">
                      {ts.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* End Game Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEndGameConfirm}
        onClose={() => setShowEndGameConfirm(false)}
        onConfirm={() => {
          completeGameMutation.mutate()
          setShowEndGameConfirm(false)
        }}
        title="End Game"
        message="Are you sure you want to end this game? Make sure all scores are recorded."
        confirmLabel="End Game"
        variant="warning"
      />
    </div>
  )
}
