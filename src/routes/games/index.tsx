import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { gameLibraryService } from '../../lib/api/services/game-library.service'
import { GameCardSkeleton } from '../../components/GameCardSkeleton'
import type { GameLibraryItem } from '../../lib/api/services/game-library.service'

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
}

function playerRange(game: GameLibraryItem): string {
  if (game.minPlayers === game.maxPlayers) return `${game.minPlayers} players`
  return `${game.minPlayers}–${game.maxPlayers} players`
}

function CatalogCard({ game }: { game: GameLibraryItem }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
        {game.difficulty && (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              DIFFICULTY_STYLES[game.difficulty] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {game.difficulty}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>👥 {playerRange(game)}</span>
        {game.estimatedDuration ? (
          <span>⏱️ ~{game.estimatedDuration} min</span>
        ) : null}
      </div>

      {game.description && (
        <p className="mt-3 text-sm text-gray-700">{game.description}</p>
      )}

      {game.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {game.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {game.rules && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700">
            How to play
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">{game.rules}</p>
        </details>
      )}
    </div>
  )
}

function GamesCatalogPage() {
  const {
    data: games,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['game-library', 'active'],
    queryFn: gameLibraryService.getActive,
  })

  const renderContent = () => {
    if (isError) {
      return (
        <div className="p-8 text-center">
          <p className="mb-2 font-medium text-red-500">
            {error instanceof Error ? error.message : 'Failed to load games'}
          </p>
          <button
            onClick={() => refetch()}
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
        <div className="p-8 text-center text-gray-500">
          No games in the catalog yet.
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <CatalogCard key={game.id} game={game} />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Games catalog</h1>
        <p className="mt-1 text-gray-600">
          The games you can play on games night. Add any of them to a session
          from its <span className="font-medium">Games</span> tab.
        </p>
      </div>
      {renderContent()}
    </div>
  )
}

export const Route = createFileRoute('/games/')({
  component: GamesCatalogPage,
})
