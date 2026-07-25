import type { Game } from '../lib/api/types'

interface GameQueueViewProps {
  games: Array<Game>
  onSelectGame: (game: Game) => void
  isLoading?: boolean
}

export function GameQueueView({
  games,
  onSelectGame,
  isLoading,
}: GameQueueViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading games...</div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">🎮</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Games Added Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Add games to this session from the Games tab to get started.
        </p>
      </div>
    )
  }

  const scheduledGames = games.filter((g) => g.status === 'NOT_STARTED')
  const inProgressGames = games.filter((g) => g.status === 'IN_PROGRESS')
  const completedGames = games.filter((g) => g.status === 'COMPLETED')

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const GameCard = ({ game }: { game: Game }) => {
    const isCompleted = game.status === 'COMPLETED'
    const isInProgress = game.status === 'IN_PROGRESS'

    return (
      <div
        className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
          isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {game.name}
            </h3>
            <p className="text-sm text-gray-600">
              {game.description || 'No description'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}
          >
            {game.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex space-x-4">
            <span>
              👥 {game.minPlayers}-{game.maxPlayers} players
            </span>
            {game.currentRound && game.maxRounds && (
              <span>
                🎯 Round {game.currentRound}/{game.maxRounds}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onSelectGame(game)}
          disabled={isCompleted}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isInProgress
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCompleted
            ? 'Game Completed'
            : isInProgress
              ? 'Resume Game'
              : 'Start Game'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* In Progress Games */}
      {inProgressGames.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Currently Playing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Games */}
      {scheduledGames.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Up Next ({scheduledGames.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Completed ({completedGames.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Session Progress
            </h3>
            <p className="text-sm text-blue-700">
              {completedGames.length} of {games.length} games completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">
              {Math.round((completedGames.length / games.length) * 100)}%
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{
              width: `${(completedGames.length / games.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
