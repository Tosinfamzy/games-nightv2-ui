import { Link, createFileRoute } from '@tanstack/react-router'
import { useGames } from '../../hooks/useGames'
import { GameCardSkeleton } from '../../components/GameCardSkeleton'
import { GameCard } from '../../components/GameCard'

function GamesPage() {
  const { data: games, isLoading, isError, error } = useGames()

  const renderContent = () => {
    if (isError) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500 font-medium mb-2">
            {error instanceof Error ? error.message : 'Failed to load games'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:text-blue-600"
          >
            Try again
          </button>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      )
    }

    if (!games?.length) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">No games found</p>
          <Link to="/games/new" className="text-blue-500 hover:text-blue-600">
            Create your first game
          </Link>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    )
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
      {renderContent()}
    </div>
  )
}

export const Route = createFileRoute('/games/index')({
  component: GamesPage,
})
