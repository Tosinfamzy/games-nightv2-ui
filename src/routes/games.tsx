import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gameLibraryService } from '../lib/api/services/game-library.service'
import type {
  CreateGameLibraryItemDTO,
  GameLibraryItem,
  UpdateGameLibraryItemDTO,
} from '../lib/api/services/game-library.service'

function GamesPage() {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGame, setEditingGame] = useState<GameLibraryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [showInactiveGames, setShowInactiveGames] = useState(false)

  // Fetch games
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
  })

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: gameLibraryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-library'] })
      setShowCreateForm(false)
    },
  })

  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateGameLibraryItemDTO
    }) => gameLibraryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-library'] })
      setEditingGame(null)
    },
  })

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: gameLibraryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-library'] })
    },
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? gameLibraryService.deactivate(id)
        : gameLibraryService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-library'] })
    },
  })

  // Form handlers
  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const categoriesInput = formData.get('categories') as string
    const categories = categoriesInput
      .split(',')
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0)

    const data: CreateGameLibraryItemDTO = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      minPlayers: parseInt(formData.get('minPlayers') as string),
      maxPlayers: parseInt(formData.get('maxPlayers') as string),
      estimatedDuration: parseInt(formData.get('estimatedDuration') as string),
      difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
      categories,
      equipment: (formData.get('equipment') as string) || undefined,
      rules: (formData.get('rules') as string) || undefined,
    }
    createGameMutation.mutate(data)
  }

  const handleUpdateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingGame) return

    const formData = new FormData(e.currentTarget)

    const categoriesInput = formData.get('categories') as string
    const categories = categoriesInput
      .split(',')
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0)

    const data: UpdateGameLibraryItemDTO = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      minPlayers: parseInt(formData.get('minPlayers') as string),
      maxPlayers: parseInt(formData.get('maxPlayers') as string),
      estimatedDuration: parseInt(formData.get('estimatedDuration') as string),
      difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
      categories,
      equipment: (formData.get('equipment') as string) || undefined,
      rules: (formData.get('rules') as string) || undefined,
    }
    updateGameMutation.mutate({ id: editingGame.id, data })
  }

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

  // Get all unique categories for filter dropdown
  const allCategories = Array.from(
    new Set(games.flatMap((game) => game.categories)),
  ).sort()

  // Filter games based on search and filters
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Game Library</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Game
          </button>
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

        {/* Create Game Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Game</h2>
            <form onSubmit={handleCreateGame} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter game name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the game..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Players *
                  </label>
                  <input
                    type="number"
                    name="minPlayers"
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Players *
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    required
                    min="1"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories *
                  <span className="text-xs text-gray-500 ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="categories"
                  required
                  placeholder="e.g. Word Game, Team Game, Party Game"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment"
                  placeholder="e.g. Cards, Timer, Score pad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rules Summary
                </label>
                <textarea
                  name="rules"
                  rows={3}
                  placeholder="Brief summary of how to play..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={createGameMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createGameMutation.isPending ? 'Adding...' : 'Add Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Game Form */}
        {editingGame && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Game</h2>
            <form onSubmit={handleUpdateGame} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingGame.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    defaultValue={editingGame.difficulty}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  defaultValue={editingGame.description}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Players *
                  </label>
                  <input
                    type="number"
                    name="minPlayers"
                    defaultValue={editingGame.minPlayers}
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Players *
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    defaultValue={editingGame.maxPlayers}
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    defaultValue={editingGame.estimatedDuration}
                    required
                    min="1"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories *
                  <span className="text-xs text-gray-500 ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="categories"
                  defaultValue={editingGame.categories.join(', ')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment"
                  defaultValue={editingGame.equipment || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rules Summary
                </label>
                <textarea
                  name="rules"
                  defaultValue={editingGame.rules || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={updateGameMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {updateGameMutation.isPending ? 'Updating...' : 'Update Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={setEditingGame}
              onDelete={(id) => {
                if (confirm('Are you sure you want to delete this game?')) {
                  deleteGameMutation.mutate(id)
                }
              }}
              onToggleActive={(id, isActive) =>
                toggleActiveMutation.mutate({ id, isActive })
              }
              getDifficultyColor={getDifficultyColor}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || categoryFilter || difficultyFilter
                ? 'No games found matching your filters.'
                : 'No games in library yet.'}
            </p>
            {!searchTerm && !categoryFilter && !difficultyFilter && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Game
              </button>
            )}
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
  onEdit: (game: GameLibraryItem) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  getDifficultyColor: (difficulty: string) => string
}

function GameCard({
  game,
  onEdit,
  onDelete,
  onToggleActive,
  getDifficultyColor,
}: GameCardProps) {
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
      <div className="mb-4">
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
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Rules:</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{game.rules}</p>
        </div>
      )}

      {/* Game Actions */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(game)}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleActive(game.id, game.isActive)}
            className={`px-3 py-1 rounded text-sm ${
              game.isActive
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {game.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(game.id)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/games')({
  component: GamesPage,
})
