import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HostOnly } from '../components/HostOnly'
import { gameLibraryService } from '../lib/api/services/game-library.service'
import type { GameLibraryItem } from '../lib/api/services/game-library.service'

// The game library is a shared, server-managed catalog (read-only over the API).
// This page lets a host browse what's available; games are added to a session
// from the session's Games tab.
function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [showInactiveGames, setShowInactiveGames] = useState(false)

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const allCategories = Array.from(
    new Set(games.flatMap((game) => game.categories)),
  ).sort()

  const filteredGames = games.filter((game) => {
    if (!showInactiveGames && !game.isActive) return false

    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      !categoryFilter || game.categories.includes(categoryFilter)

    const matchesDifficulty =
      !difficultyFilter || game.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (gamesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading games...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Game Library</h1>
          <p className="text-gray-500 mt-1 text-sm">
            A shared catalog of games you can add to a session from its Games
            tab.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Games
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showInactiveGames}
                  onChange={(e) => setShowInactiveGames(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Show inactive games
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              getDifficultyColor={getDifficultyColor}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || categoryFilter || difficultyFilter
                ? 'No games found matching your filters.'
                : 'No games in the library yet.'}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Games
            </h3>
            <p className="text-3xl font-bold text-blue-600">{games.length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Active Games
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {games.filter((g) => g.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Categories
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {allCategories.length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Avg Duration
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {games.length > 0
                ? Math.round(
                    games.reduce((sum, g) => sum + g.estimatedDuration, 0) /
                      games.length,
                  )
                : 0}
              min
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface GameCardProps {
  game: GameLibraryItem
  getDifficultyColor: (difficulty: string) => string
}

function GameCard({ game, getDifficultyColor }: GameCardProps) {
  return (
    <div
      className={`border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow ${!game.isActive ? 'opacity-60' : ''}`}
    >
      {/* Game Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{game.name}</h2>
        <div className="flex space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}
          >
            {game.difficulty}
          </span>
          {!game.isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Game Details */}
      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
        {game.description}
      </p>

      {/* Game Stats */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>
            <strong>Players:</strong> {game.minPlayers}-{game.maxPlayers}
          </span>
          <span>
            <strong>Duration:</strong> {game.estimatedDuration}min
          </span>
        </div>
        {game.equipment && (
          <div>
            <strong>Equipment:</strong> {game.equipment}
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <div className="flex flex-wrap gap-1">
          {game.categories.map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Rules Preview */}
      {game.rules && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Rules:</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{game.rules}</p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/games')({
  component: () => (
    <HostOnly title="Games">
      <GamesPage />
    </HostOnly>
  ),
})
