import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TeamFormationStrategy } from '../lib/api/types/team.dto'
import { teamService } from '../lib/api/services/team.service'
import { showToast, toastHelpers } from '../lib/toast'
import type { CreateTeamsDto } from '../lib/api/types/team.dto'

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
  const [selectedStrategy, setSelectedStrategy] =
    useState<TeamFormationStrategy>(TeamFormationStrategy.AUTOMATIC)
  const [manualTeamCount, setManualTeamCount] = useState<number>(2)
  const [selectedGameForFormation, setSelectedGameForFormation] =
    useState<string>(selectedGame?.id || '')
  const [customizeNames, setCustomizeNames] = useState(false)
  const [teamNames, setTeamNames] = useState<Array<string>>([])
  const [customizeColors, setCustomizeColors] = useState(false)
  const [teamColors, setTeamColors] = useState<Array<string>>([])

  // Default colors matching backend
  const DEFAULT_COLORS = [
    '#FF5733',
    '#3366FF',
    '#28A745',
    '#FFC107',
    '#6F42C1',
    '#FD7E14',
    '#20C997',
    '#E83E8C',
  ]

  const queryClient = useQueryClient()

  // Fetch team formation suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['team-suggestions', selectedGameForFormation],
    queryFn: () =>
      selectedGameForFormation
        ? teamService.getTeamSuggestions(selectedGameForFormation)
        : null,
    enabled: !!selectedGameForFormation,
  })

  // Auto team formation mutation
  const createTeamsMutation = useMutation({
    mutationFn: (params: {
      gameId: string
      strategy: TeamFormationStrategy
      teamCount: number
    }) => {
      const dto: CreateTeamsDto = {
        strategy: params.strategy,
        teamCount: params.teamCount,
        ...(customizeNames && teamNames.length > 0 && { teamNames }),
        ...(customizeColors && teamColors.length > 0 && { teamColors }),
      }
      return teamService.createTeams(params.gameId, dto)
    },
    onSuccess: (teams) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'game', selectedGameForFormation],
      })
      queryClient.invalidateQueries({
        queryKey: ['games', selectedGameForFormation],
      })
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
      // Refresh the session screen's team/player roster (sessionKeys.teams).
      queryClient.invalidateQueries({
        queryKey: ['sessions', 'detail', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', sessionId],
      })
      toastHelpers.withCount('Created', teams.length, 'team')
      onTeamsCreated(teams as any)
    },
    onError: (error) => {
      toastHelpers.operationError('create teams', error)
    },
  })

  // Rebalance teams mutation
  const rebalanceTeamsMutation = useMutation({
    mutationFn: (params: {
      gameId: string
      strategy: TeamFormationStrategy
    }) => {
      return teamService.rebalanceTeams(params.gameId, params.strategy)
    },
    onSuccess: (teams) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'game', selectedGameForFormation],
      })
      queryClient.invalidateQueries({
        queryKey: ['sessions', 'detail', sessionId],
      })
      showToast.success(
        `${teams.length} teams rebalanced with ${selectedStrategy} strategy`,
      )
      onTeamsCreated(teams as any)
    },
    onError: (error) => {
      toastHelpers.operationError('rebalance teams', error)
    },
  })

  const handleAutoFormation = () => {
    if (!selectedGameForFormation) return

    createTeamsMutation.mutate({
      gameId: selectedGameForFormation,
      strategy: selectedStrategy,
      teamCount:
        selectedStrategy === TeamFormationStrategy.MANUAL ? manualTeamCount : 2,
    })
  }

  const handleRebalance = () => {
    if (!selectedGameForFormation) return
    rebalanceTeamsMutation.mutate({
      gameId: selectedGameForFormation,
      strategy: selectedStrategy,
    })
  }

  const getUnassignedPlayers = () => {
    const assignedPlayerIds = teams.flatMap((team) =>
      (team.players || []).map((p) => p.id),
    )
    return players.filter((player) => !assignedPlayerIds.includes(player.id))
  }

  const getStrategyDescription = (strategy: TeamFormationStrategy): string => {
    const descriptions = {
      [TeamFormationStrategy.BALANCED]:
        'Snake draft distribution - ensures even skill levels across teams by alternating picks',
      [TeamFormationStrategy.RANDOM]:
        'Random assignment - simple shuffle and distribute for casual games',
      [TeamFormationStrategy.AUTOMATIC]:
        'Smart distribution - balanced assignment with randomization',
      [TeamFormationStrategy.MANUAL]:
        'Create empty teams - you assign players manually after creation',
    }
    return descriptions[strategy] || ''
  }

  const unassignedPlayers = getUnassignedPlayers()
  const currentGame = games.find((g) => g.id === selectedGameForFormation)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Team Formation</h3>
        <p className="text-sm text-gray-600 mt-1">
          Organize players into balanced teams for optimal gameplay
        </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
              <div className="flex justify-between sm:block">
                <span className="font-medium">Min Players:</span>{' '}
                <span>{currentGame.minPlayers}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="font-medium">Max Players:</span>{' '}
                <span>{currentGame.maxPlayers}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="font-medium">Team Size:</span>{' '}
                <span>{currentGame.recommendedTeamSize}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formation Suggestions */}
      {suggestions &&
        suggestions.suggestions &&
        suggestions.suggestions.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-blue-900 text-lg">
                Formation Suggestions
              </h4>
              {suggestions.validation && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    suggestions.validation.isValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {suggestions.validation.isValid ? '✅' : '⚠️'}
                  {suggestions.validation.isValid ? ' Valid' : ' Issues'}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {suggestions.suggestions.slice(0, 3).map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      {suggestion.teamCount} teams × {suggestion.playersPerTeam}{' '}
                      players
                      {suggestion.remainder > 0 &&
                        ` (+${suggestion.remainder} with extra player)`}
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {suggestion.strategy}
                    </span>
                  </div>

                  {suggestion.pros && suggestion.pros.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-green-700 mb-1">
                        Pros:
                      </div>
                      <ul className="space-y-1">
                        {suggestion.pros.map((pro, proIndex) => (
                          <li
                            key={proIndex}
                            className="text-xs text-green-700 flex items-start"
                          >
                            <span className="mr-1 flex-shrink-0">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestion.cons && suggestion.cons.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-amber-700 mb-1">
                        Cons:
                      </div>
                      <ul className="space-y-1">
                        {suggestion.cons.map((con, conIndex) => (
                          <li
                            key={conIndex}
                            className="text-xs text-amber-700 flex items-start"
                          >
                            <span className="mr-1 flex-shrink-0">⚠</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {suggestions.validation &&
              suggestions.validation.warnings &&
              suggestions.validation.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-semibold text-yellow-900 text-sm mb-1">
                    Warnings:
                  </div>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {suggestions.validation.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">⚠️</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {suggestions.validation &&
              suggestions.validation.errors &&
              suggestions.validation.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-semibold text-red-900 text-sm mb-1">
                    Errors:
                  </div>
                  <ul className="text-sm text-red-800 space-y-1">
                    {suggestions.validation.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">❌</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

      {/* Strategy Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Formation Strategy</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: TeamFormationStrategy.AUTOMATIC,
              label: 'Smart Auto',
              icon: '🤖',
              recommended: false,
            },
            {
              id: TeamFormationStrategy.BALANCED,
              label: 'Balanced',
              icon: '⚖️',
              recommended: true,
            },
            {
              id: TeamFormationStrategy.RANDOM,
              label: 'Random',
              icon: '🎲',
              recommended: false,
            },
            {
              id: TeamFormationStrategy.MANUAL,
              label: 'Manual',
              icon: '✋',
              recommended: false,
            },
          ].map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all
                ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {strategy.recommended && (
                <div className="absolute top-2 right-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                    Recommended
                  </span>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <input
                    type="radio"
                    name="strategy"
                    value={strategy.id}
                    checked={selectedStrategy === strategy.id}
                    onChange={(e) =>
                      setSelectedStrategy(
                        e.target.value as TeamFormationStrategy,
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{strategy.icon}</span>
                    <span className="font-bold text-lg">{strategy.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getStrategyDescription(strategy.id)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedStrategy === TeamFormationStrategy.MANUAL && (
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

        {/* Team Name Customization */}
        {selectedStrategy !== TeamFormationStrategy.MANUAL && (
          <div className="mt-4 border-t pt-4">
            <label className="flex items-center space-x-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={customizeNames}
                onChange={(e) => {
                  setCustomizeNames(e.target.checked)
                  if (e.target.checked) {
                    const count = suggestions?.suggestions?.[0]?.teamCount || 2
                    setTeamNames(
                      Array(count)
                        .fill('')
                        .map((_, i) => `Team ${i + 1}`),
                    )
                  }
                }}
                className="rounded"
              />
              <span className="font-medium text-gray-900">
                Customize team names
              </span>
            </label>

            {customizeNames && (
              <div className="space-y-2 ml-6">
                {Array.from({
                  length: suggestions?.suggestions?.[0]?.teamCount || 2,
                }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    value={teamNames[index] || ''}
                    onChange={(e) => {
                      const newNames = [...teamNames]
                      newNames[index] = e.target.value
                      setTeamNames(newNames)
                    }}
                    placeholder={`Team ${index + 1} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            )}

            {/* Team Color Customization */}
            <div className="mt-3">
              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={customizeColors}
                  onChange={(e) => {
                    setCustomizeColors(e.target.checked)
                    if (e.target.checked) {
                      const count =
                        suggestions?.suggestions?.[0]?.teamCount || 2
                      setTeamColors(DEFAULT_COLORS.slice(0, count))
                    }
                  }}
                  className="rounded"
                />
                <span className="font-medium text-gray-900">
                  Customize team colors
                </span>
              </label>

              {customizeColors && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-6">
                  {Array.from({
                    length: suggestions?.suggestions?.[0]?.teamCount || 2,
                  }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <input
                        type="color"
                        value={
                          teamColors[index] ||
                          DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                        }
                        onChange={(e) => {
                          const newColors = [...teamColors]
                          newColors[index] = e.target.value
                          setTeamColors(newColors)
                        }}
                        className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                      />
                      <span className="text-xs mt-1 text-gray-600">
                        Team {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleAutoFormation}
          disabled={
            !selectedGameForFormation ||
            createTeamsMutation.isPending ||
            unassignedPlayers.length === 0
          }
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
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
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {rebalanceTeamsMutation.isPending ? (
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
