import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionManagementService } from '../lib/api/services/session-management.service'
import { gameLibraryService } from '../lib/api/services/game-library.service'

interface Player {
  id: string
  name: string
  status: 'ready' | 'not_ready' | 'playing'
}

interface Game {
  id: string
  name: string
  description?: string
  minPlayers: number
  maxPlayers: number
  estimatedDuration?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
  status: 'scheduled' | 'in_progress' | 'completed'
}

interface Team {
  id: string
  name: string
  players: Array<Player>
}

interface EnhancedGamesTabProps {
  sessionId: string
  sessionGames: Array<Game>
  players: Array<Player>
  teams: Array<Team>
  sessionStatus: string
}

export function EnhancedGamesTab({
  sessionId,
  sessionGames,
  players,
  teams,
  sessionStatus,
}: EnhancedGamesTabProps) {
  const [showAddGames, setShowAddGames] = useState(false)
  const [selectedGames, setSelectedGames] = useState<Array<string>>([])
  const [gameFilter, setGameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const queryClient = useQueryClient()

  // Fetch available games for adding
  const { data: availableGames = [] } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
    enabled: showAddGames,
  })

  // Add games to session
  const addGamesMutation = useMutation({
    mutationFn: (gameLibraryIds: Array<string>) =>
      sessionManagementService.addGamesToSession(sessionId, { gameLibraryIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', sessionId, 'games'],
      })
      setShowAddGames(false)
      setSelectedGames([])
    },
  })

  // Remove game from session
  const removeGameMutation = useMutation({
    mutationFn: (gameId: string) =>
      sessionManagementService.removeGamesFromSession(sessionId, { gameId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', sessionId, 'games'],
      })
    },
  })

  const getGameCompatibility = (game: Game) => {
    const playerCount = players.length
    const isCompatible =
      playerCount >= game.minPlayers && playerCount <= game.maxPlayers

    return {
      isCompatible,
      message: isCompatible
        ? `Compatible with ${playerCount} players`
        : playerCount < game.minPlayers
          ? `Needs ${game.minPlayers - playerCount} more players`
          : `${playerCount - game.maxPlayers} too many players`,
      color: isCompatible ? 'green' : 'red',
    }
  }

  const getTeamCompatibility = (game: Game) => {
    if (teams.length === 0) {
      return {
        isCompatible: false,
        message: 'No teams formed',
        color: 'yellow',
      }
    }

    const avgTeamSize = players.length / teams.length
    const recommendedTeamSize = Math.ceil(
      game.maxPlayers / Math.max(teams.length, 2),
    )

    const isGoodFit = Math.abs(avgTeamSize - recommendedTeamSize) <= 1

    return {
      isCompatible: isGoodFit,
      message: isGoodFit
        ? `Good fit for ${teams.length} teams`
        : `Consider ${Math.ceil(game.maxPlayers / avgTeamSize)} teams`,
      color: isGoodFit ? 'green' : 'yellow',
    }
  }

  const getGameStatus = (game: Game) => {
    const compatibility = getGameCompatibility(game)
    const teamCompatibility = getTeamCompatibility(game)

    if (!compatibility.isCompatible) return 'incompatible'
    if (!teamCompatibility.isCompatible) return 'needs-attention'
    return 'ready'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✅'
      case 'needs-attention':
        return '⚠️'
      case 'incompatible':
        return '❌'
      case 'in_progress':
        return '🎮'
      case 'completed':
        return '🏁'
      default:
        return '⏳'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'needs-attention':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'incompatible':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'completed':
        return 'bg-gray-50 border-gray-200 text-gray-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const filteredAvailableGames = availableGames.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(gameFilter.toLowerCase()) ||
      (game.description &&
        game.description.toLowerCase().includes(gameFilter.toLowerCase()))
    const matchesCategory =
      !categoryFilter || (game as any).category === categoryFilter
    const notAlreadyAdded = !sessionGames.some((sg) => sg.id === game.id)

    return matchesSearch && matchesCategory && notAlreadyAdded
  })

  const categories = [
    ...new Set(
      availableGames.map((game) => (game as any).category).filter(Boolean),
    ),
  ]

  const gameStats = {
    total: sessionGames.length,
    ready: sessionGames.filter((game) => getGameStatus(game) === 'ready')
      .length,
    needsAttention: sessionGames.filter(
      (game) => getGameStatus(game) === 'needs-attention',
    ).length,
    incompatible: sessionGames.filter(
      (game) => getGameStatus(game) === 'incompatible',
    ).length,
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Games Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage games for this session and check compatibility
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {gameStats.ready}
            </div>
            <div className="text-xs text-gray-600">Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {gameStats.needsAttention}
            </div>
            <div className="text-xs text-gray-600">Needs Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {gameStats.incompatible}
            </div>
            <div className="text-xs text-gray-600">Incompatible</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">
          {sessionGames.length === 0
            ? 'No games added yet. Add games to get started.'
            : `${sessionGames.length} games configured for this session`}
        </div>
        <button
          onClick={() => setShowAddGames(true)}
          disabled={
            sessionStatus === 'in_progress' || sessionStatus === 'completed'
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Games
        </button>
      </div>

      {/* Games List */}
      {sessionGames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessionGames.map((game) => {
            const compatibility = getGameCompatibility(game)
            const teamCompatibility = getTeamCompatibility(game)
            const status = getGameStatus(game)

            return (
              <div
                key={game.id}
                className={`border rounded-lg p-4 ${getStatusColor(status)}`}
              >
                {/* Game Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{game.name}</h4>
                    {game.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {game.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(status)}</span>
                    {sessionStatus === 'scheduled' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${game.name}" from session?`)) {
                            removeGameMutation.mutate(game.id)
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Remove game"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Game Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Players:</span>
                    <span className="font-medium">
                      {game.minPlayers}-{game.maxPlayers}
                    </span>
                  </div>
                  {game.estimatedDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {game.estimatedDuration} min
                      </span>
                    </div>
                  )}
                  {game.difficulty && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span
                        className={`font-medium capitalize ${
                          game.difficulty === 'easy'
                            ? 'text-green-600'
                            : game.difficulty === 'medium'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {game.difficulty}
                      </span>
                    </div>
                  )}
                </div>

                {/* Compatibility Info */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        compatibility.color === 'green'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span>{compatibility.message}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        teamCompatibility.color === 'green'
                          ? 'bg-green-500'
                          : teamCompatibility.color === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <span>{teamCompatibility.message}</span>
                  </div>
                </div>

                {/* Game Description */}
                {game.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {game.description}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Games Added
          </h3>
          <p className="text-gray-600 mb-4">
            Add games from the library to start planning your session
          </p>
          <button
            onClick={() => setShowAddGames(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Game Library
          </button>
        </div>
      )}

      {/* Add Games Modal */}
      {showAddGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Games to Session</h3>
                <button
                  onClick={() => {
                    setShowAddGames(false)
                    setSelectedGames([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Filters */}
              <div className="mt-4 flex space-x-4">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableGames.map((game) => {
                  const gameForCompatibility = {
                    ...game,
                    status: 'scheduled' as const,
                    difficulty: game.difficulty.toLowerCase() as
                      | 'easy'
                      | 'medium'
                      | 'hard'
                      | undefined,
                  }
                  const compatibility =
                    getGameCompatibility(gameForCompatibility)
                  const isSelected = selectedGames.includes(game.id)

                  return (
                    <label
                      key={game.id}
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGames([...selectedGames, game.id])
                            } else {
                              setSelectedGames(
                                selectedGames.filter((id) => id !== game.id),
                              )
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {game.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {game.minPlayers}-{game.maxPlayers} players
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              compatibility.isCompatible
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {compatibility.message}
                          </p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {filteredAvailableGames.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No games found matching your criteria
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedGames.length} games selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddGames(false)
                    setSelectedGames([])
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addGamesMutation.mutate(selectedGames)}
                  disabled={
                    selectedGames.length === 0 || addGamesMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addGamesMutation.isPending
                    ? 'Adding...'
                    : `Add ${selectedGames.length} Games`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
