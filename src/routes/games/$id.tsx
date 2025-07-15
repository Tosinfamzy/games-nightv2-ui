import { createFileRoute } from '@tanstack/react-router'
import { useGame } from '../../hooks/useGames'

export const Route = createFileRoute('/games/$id')({
  component: GameDetailsPage,
})

function GameDetailsPage() {
  const { id } = Route.useParams()
  const { data: game, isLoading } = useGame(id)

  if (isLoading) {
    return <div className="p-4">Loading game...</div>
  }

  if (!game) {
    return <div className="p-4">Game not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{game.name}</h1>
          <span
            className={`px-3 py-1 text-sm rounded ${
              game.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : game.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {game.status}
          </span>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{game.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Game Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Round</p>
                <p className="font-medium">{game.currentRound}</p>
              </div>
              <div>
                <p className="text-gray-600">Session</p>
                <p className="font-medium">{game.sessionId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
