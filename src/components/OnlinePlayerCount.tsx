/* eslint-disable @typescript-eslint/array-type */
import type { Player } from '../lib/api/types'

interface OnlinePlayerCountProps {
  players: Player[]
  showDetails?: boolean
  className?: string
}

/**
 * Display count of online players
 */
export default function OnlinePlayerCount({
  players,
  showDetails = false,
  className = '',
}: OnlinePlayerCountProps) {
  const totalCount = players.length

  // Use blue color for player count display
  const colorClasses = 'bg-blue-100 text-blue-800 border-blue-200'

  if (showDetails) {
    return (
      <div className={`inline-flex flex-col gap-2 ${className}`}>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${colorClasses}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold">
              {totalCount} {totalCount === 1 ? 'Player' : 'Players'}
            </p>
            <p className="text-xs opacity-75">in session</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses} ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <span className="text-sm font-medium">
        {totalCount} {totalCount === 1 ? 'player' : 'players'}
      </span>
    </div>
  )
}
