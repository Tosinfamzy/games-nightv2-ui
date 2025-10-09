import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface Player {
  id: string
  name: string
  status: 'ready' | 'not_ready' | 'playing'
  skillLevel?: number
}

interface Team {
  id: string
  name: string
  color?: string
  players: Array<Player>
  balanceScore?: number
}

interface Game {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  recommendedTeamSize: number
}

interface TeamFormationSuggestion {
  isValid: boolean
  recommendedTeamCount: number
  recommendedTeamSize: number
  issues: Array<string>
  suggestions: Array<string>
  proposedTeams?: Array<Team>
}

interface TeamFormationInterfaceProps {
  sessionId: string
  players: Array<Player>
  teams: Array<Team>
  games: Array<Game>
  selectedGame?: Game
  onTeamsCreated: (teams: Array<Team>) => void
}

export function TeamFormationInterface({
  sessionId,
  players,
  teams,
  games,
  selectedGame,
  onTeamsCreated,
}: TeamFormationInterfaceProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<
    'automatic' | 'balanced' | 'random' | 'manual'
  >('automatic')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [manualTeamCount, setManualTeamCount] = useState<number>(2)
  const [selectedGameForFormation, setSelectedGameForFormation] =
    useState<string>(selectedGame?.id || '')

  const queryClient = useQueryClient()

  // Fetch team formation suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['team-suggestions', selectedGameForFormation],
    queryFn: () => fetchTeamSuggestions(selectedGameForFormation),
    enabled: !!selectedGameForFormation,
  })

  // Auto team formation mutation
  const createTeamsMutation = useMutation({
    mutationFn: async (params: {
      gameId: string
      strategy: string
      teamCount?: number
    }) => {
      return await fetchAPI(`/teams/game/${params.gameId}/create`, {
        method: 'POST',
        body: JSON.stringify({
          strategy: params.strategy,
          teamCount: params.teamCount,
          playerIds: players.map((p) => p.id),
        }),
      })
    },
    onSuccess: (newTeams) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      onTeamsCreated(newTeams)
    },
  })

  // Rebalance teams mutation
  const rebalanceTeamsMutation = useMutation({
    mutationFn: async (strategy: string) => {
      return await fetchAPI(
        `/teams/game/${selectedGameForFormation}/rebalance`,
        {
          method: 'PUT',
          body: JSON.stringify({ strategy }),
        },
      )
    },
    onSuccess: (rebalancedTeams) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      onTeamsCreated(rebalancedTeams)
    },
  })

  const handleAutoFormation = () => {
    if (!selectedGameForFormation) return

    createTeamsMutation.mutate({
      gameId: selectedGameForFormation,
      strategy: selectedStrategy,
      teamCount: selectedStrategy === 'manual' ? manualTeamCount : undefined,
    })
  }

  const handleRebalance = () => {
    rebalanceTeamsMutation.mutate(selectedStrategy)
  }

  const getUnassignedPlayers = () => {
    const assignedPlayerIds = teams.flatMap((team) =>
      (team.players || []).map((p) => p.id),
    )
    return players.filter((player) => !assignedPlayerIds.includes(player.id))
  }

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'automatic':
        return 'AI-powered balancing based on player skills and game requirements'
      case 'balanced':
        return 'Even distribution considering player experience and availability'
      case 'random':
        return 'Random assignment for casual games'
      case 'manual':
        return 'Specify exact team count and manually assign players'
      default:
        return ''
    }
  }

  const unassignedPlayers = getUnassignedPlayers()
  const currentGame = games.find((g) => g.id === selectedGameForFormation)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Team Formation
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Organize players into balanced teams for optimal gameplay
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
      </div>

      {/* Game Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Select Game</h4>
        <select
          value={selectedGameForFormation}
          onChange={(e) => setSelectedGameForFormation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a game...</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name} ({game.minPlayers}-{game.maxPlayers} players)
            </option>
          ))}
        </select>

        {currentGame && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Min Players:</span>{' '}
                {currentGame.minPlayers}
              </div>
              <div>
                <span className="font-medium">Max Players:</span>{' '}
                {currentGame.maxPlayers}
              </div>
              <div>
                <span className="font-medium">Team Size:</span>{' '}
                {currentGame.recommendedTeamSize}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formation Suggestions */}
      {suggestions && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Formation Analysis</h4>

          <div
            className={`p-3 rounded-lg mb-3 ${
              suggestions.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {suggestions.isValid ? '✅' : '⚠️'}
              </span>
              <span className="font-medium">
                {suggestions.isValid
                  ? 'Formation Valid'
                  : 'Formation Issues Detected'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Recommended Teams</div>
              <div className="text-xl font-semibold">
                {suggestions.recommendedTeamCount}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Players per Team</div>
              <div className="text-xl font-semibold">
                {suggestions.recommendedTeamSize}
              </div>
            </div>
          </div>

          {suggestions.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-orange-800 mb-2">Issues:</h5>
              <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                {suggestions.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.suggestions.length > 0 && (
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Suggestions:</h5>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                {suggestions.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Strategy Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Formation Strategy</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'automatic', label: 'Smart Auto', icon: '🤖' },
            { id: 'balanced', label: 'Balanced', icon: '⚖️' },
            { id: 'random', label: 'Random', icon: '🎲' },
            { id: 'manual', label: 'Manual', icon: '✋' },
          ].map((strategy) => (
            <label
              key={strategy.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="strategy"
                value={strategy.id}
                checked={selectedStrategy === strategy.id}
                onChange={(e) =>
                  setSelectedStrategy(
                    e.target.value as
                      | 'automatic'
                      | 'balanced'
                      | 'random'
                      | 'manual',
                  )
                }
                className="sr-only"
              />
              <span className="text-xl mr-3">{strategy.icon}</span>
              <div>
                <div className="font-medium">{strategy.label}</div>
                <div className="text-sm text-gray-600">
                  {getStrategyDescription(strategy.id)}
                </div>
              </div>
            </label>
          ))}
        </div>

        {selectedStrategy === 'manual' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Teams
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={manualTeamCount}
              onChange={(e) => setManualTeamCount(parseInt(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Advanced Options</h4>

          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Consider player skill levels</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Avoid pairing specific players</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">
                Preserve existing team preferences
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Player Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Player Status ({players.length} total)
        </h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Unassigned</div>
            <div className="text-xl font-semibold text-green-800">
              {unassignedPlayers.length}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">In Teams</div>
            <div className="text-xl font-semibold text-blue-800">
              {players.length - unassignedPlayers.length}
            </div>
          </div>
        </div>

        {unassignedPlayers.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Unassigned Players:
            </h5>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map((player) => (
                <span
                  key={player.id}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    player.status === 'ready'
                      ? 'bg-green-100 text-green-800'
                      : player.status === 'playing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {player.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleAutoFormation}
          disabled={
            !selectedGameForFormation ||
            createTeamsMutation.isPending ||
            unassignedPlayers.length === 0
          }
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTeamsMutation.isPending ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Teams...
            </span>
          ) : (
            '🚀 Create Teams'
          )}
        </button>

        {teams.length > 0 && (
          <button
            onClick={handleRebalance}
            disabled={
              !selectedGameForFormation || rebalanceTeamsMutation.isPending
            }
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rebalanceTeamsMutation.isPending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Rebalancing...
              </span>
            ) : (
              '⚖️ Rebalance Teams'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Helper functions
async function fetchAPI(url: string, options?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

async function fetchTeamSuggestions(
  gameId: string,
): Promise<TeamFormationSuggestion> {
  return fetchAPI(`/teams/game/${gameId}/suggestions`)
}
