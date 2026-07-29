import { Link, createFileRoute } from '@tanstack/react-router'
import { useGame, useUpdateGame } from '../../hooks/useGames'
import { GameStatus } from '../../lib/api/types'
import { QueryErrorDisplay } from '../../components/QueryErrorDisplay'

function GameDetailsPage() {
  const { id } = Route.useParams()
  const { data: game, isLoading, isError, error } = useGame(id)
  const { mutate: updateGame } = useUpdateGame(id)

  if (isLoading) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <QueryErrorDisplay
        error={
          error instanceof Error ? error : new Error('Failed to load game')
        }
        onRetry={() => window.location.reload()}
        backTo="/games"
      />
    )
  }

  if (!game) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Game not found</p>
        <Link to="/games" className="text-blue-500 hover:text-blue-600">
          Back to Games
        </Link>
      </div>
    )
  }

  const handleGameAction = (newStatus: GameStatus) => {
    updateGame({
      status: newStatus,
    })
  }

  const getActionButton = () => {
    switch (game.status) {
      case GameStatus.PENDING:
        return (
          <button
            onClick={() => handleGameAction(GameStatus.IN_PROGRESS)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start Game
          </button>
        )
      case GameStatus.IN_PROGRESS:
        return (
          <button
            onClick={() => handleGameAction(GameStatus.COMPLETED)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            End Game
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/games"
          className="text-blue-500 hover:text-blue-600 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Games
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {game.name}
            </h1>
            <p className="text-gray-600">{game.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${
                game.status === GameStatus.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : game.status === GameStatus.IN_PROGRESS
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {game.status}
            </span>
            {getActionButton()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Game Details</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Round: {game.currentRound} of {game.maxRounds}
              </p>
              <p>Session ID: {game.sessionId}</p>
              <p>Teams: {game.teams.length}</p>
            </div>
          </div>

          {/* Player/Team section placeholder */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">
              Players & Teams
            </h2>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>

          {/* Score section placeholder */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Scores</h2>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/games/$id')({
  component: GameDetailsPage,
})
