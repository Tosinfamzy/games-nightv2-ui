import { Link } from '@tanstack/react-router'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
      role="article"
    >
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{game.name}</h2>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
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

      <p className="text-gray-600 mb-4 line-clamp-2">{game.description}</p>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            Round {game.currentRound} of {game.maxRounds}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <span>
            {game.minPlayers}-{game.maxPlayers} players
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span>
            Last updated {new Date(game.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t">
        <Link
          to="/games/$id"
          params={{ id: game.id }}
          className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 -ml-2"
        >
          View Game
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  )
}
