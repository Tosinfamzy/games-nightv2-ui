import { Link } from '@tanstack/react-router'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
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
        <span className="text-sm text-gray-500">Round {game.currentRound}</span>
        <Link
          to="/games/$id"
          params={{ id: game.id }}
          className="text-blue-500 hover:text-blue-600"
        >
          View Game →
        </Link>
      </div>
    </div>
  )
}
