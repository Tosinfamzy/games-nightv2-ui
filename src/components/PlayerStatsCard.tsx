import { usePlayerStats } from '../hooks/useGameHistory'
import type { UUID } from '../lib/api/types'

interface PlayerStatsCardProps {
  playerId: UUID
}

export default function PlayerStatsCard({ playerId }: PlayerStatsCardProps) {
  const { data: stats, isLoading, error } = usePlayerStats(playerId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Failed to load statistics</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        {stats.playerName}'s Statistics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">
            {stats.gamesPlayed}
          </p>
          <p className="text-sm text-gray-600 mt-1">Games Played</p>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{stats.gamesWon}</p>
          <p className="text-sm text-gray-600 mt-1">Games Won</p>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-3xl font-bold text-purple-600">
            {(stats.winRate * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Win Rate</p>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-3xl font-bold text-orange-600">
            {stats.averageScore.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Avg Score</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        {stats.favoriteGame && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Favorite Game:</span>{' '}
            {stats.favoriteGame}
          </p>
        )}
        {stats.lastPlayedAt && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Last Played:</span>{' '}
            {new Date(stats.lastPlayedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}
