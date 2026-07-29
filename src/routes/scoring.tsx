import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { HostOnly } from '../components/HostOnly'
import { gameService } from '../lib/api/services/game.service'
import { teamService } from '../lib/api/services/team.service'
import { LiveScoreboard } from '../components/LiveScoreboard'

export const Route = createFileRoute('/scoring')({
  component: () => (
    <HostOnly title="Live scoring">
      <Scoring />
    </HostOnly>
  ),
})

function Scoring() {
  const queryClient = useQueryClient()
  const [selectedGame, setSelectedGame] = useState<string>('')

  // Queries
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: gameService.getAll,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', 'game', selectedGame],
    queryFn: () => teamService.getByGame(selectedGame),
    enabled: Boolean(selectedGame),
  })

  const selectedGameData = games.find((game) => game.id === selectedGame)

  // Game state mutations
  const startFirstRoundMutation = useMutation({
    mutationFn: (gameId: string) => gameService.startFirstRound(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const updateGameMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      gameService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })

  const handleGameStateChange = (
    action: 'start' | 'end' | 'nextRound' | 'startFirstRound',
  ) => {
    if (!selectedGameData) return

    if (action === 'startFirstRound') {
      startFirstRoundMutation.mutate(selectedGameData.id)
      return
    }

    let updateData: any = {}

    switch (action) {
      case 'start':
        updateData = {
          status: 'IN_PROGRESS',
          currentRound: 1,
        }
        break
      case 'nextRound':
        updateData = {
          currentRound: selectedGameData.currentRound + 1,
        }
        break
      case 'end':
        updateData = {
          status: 'COMPLETED',
        }
        break
    }

    updateGameMutation.mutate({ id: selectedGame, data: updateData })
  }

  if (gamesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Live Scoring</h1>

        {/* Game Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Game to Score
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a game...</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name} - {game.status} (Round {game.currentRound}/
                {game.maxRounds})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Information */}
      {selectedGameData && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Game</h3>
                <p className="text-lg font-semibold">{selectedGameData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Session</h3>
                <p className="text-lg font-semibold">
                  {selectedGameData.sessionId || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Status</h3>
                <p
                  className={`text-lg font-semibold ${
                    selectedGameData.status === 'IN_PROGRESS' ||
                    selectedGameData.status === 'ROUND_IN_PROGRESS'
                      ? 'text-green-600'
                      : selectedGameData.status === 'PENDING'
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                  }`}
                >
                  {selectedGameData.status}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Teams</h3>
                <p className="text-lg font-semibold">{teams.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Scoreboard */}
      {selectedGame && selectedGameData && teams.length > 0 ? (
        <LiveScoreboard
          gameId={selectedGame}
          teams={teams.map((team) => ({
            id: team.id,
            name: team.name,
            color: team.color,
          }))}
          currentRound={selectedGameData.currentRound}
          maxRounds={selectedGameData.maxRounds}
          gameStatus={selectedGameData.status}
          onGameStateChange={handleGameStateChange}
        />
      ) : selectedGame && teams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl text-gray-600 mb-2">No Teams Found</h3>
          <p className="text-gray-500">
            This game doesn't have any teams assigned yet.
            <br />
            Please create teams before starting the scoring.
          </p>
          <button
            onClick={() => (window.location.href = '/teams')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Manage Teams
          </button>
        </div>
      ) : selectedGame ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-400 text-6xl mb-4">⏳</div>
          <h3 className="text-xl text-gray-600 mb-2">Loading Game Data</h3>
          <p className="text-gray-500">
            Please wait while we load the game information...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h3 className="text-xl text-gray-600 mb-2">Select a Game</h3>
          <p className="text-gray-500">
            Choose a game from the dropdown above to start live scoring.
          </p>
        </div>
      )}
    </div>
  )
}
