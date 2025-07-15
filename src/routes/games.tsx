import { Link, createFileRoute } from '@tanstack/react-router'
import { useGames } from '../hooks/useGames'

function GamesPage() {
  const { data: games, isLoading } = useGames()

  if (isLoading) {
    return <div className="p-4">Loading games...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Games</h1>
        <Link
          to="/games/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Game
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games?.map((game) => (
          <div
            key={game.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <span
                className={`px-2 py-1 text-xs rounded ${
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
            <p className="text-gray-600 mb-4">{game.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Players: {game.minPlayers}-{game.maxPlayers}
              </span>
              <Link
                to="/games/$id"
                params={{ id: game.id }}
                className="text-blue-500 hover:text-blue-600"
              >
                View Game →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/games')({
  component: GamesPage,
})
