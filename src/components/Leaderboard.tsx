import { useLeaderboard } from '../hooks/useGameHistory'

interface LeaderboardProps {
  limit?: number
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const { data: players, isLoading, error } = useLeaderboard(limit)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Top Players</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center space-x-4 p-3"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !players) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Top Players</h3>
        <p className="text-red-500">Failed to load leaderboard</p>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Top Players</h3>
        <p className="text-gray-500 text-center py-8">
          No players with game history yet.
        </p>
      </div>
    )
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500' // Gold
      case 1:
        return 'bg-gray-400' // Silver
      case 2:
        return 'bg-orange-600' // Bronze
      default:
        return 'bg-gray-300 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Top Players</h3>

      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.playerId}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Rank */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getMedalColor(
                index,
              )}`}
            >
              {index + 1}
            </div>

            {/* Player info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{player.playerName}</p>
              <p className="text-sm text-gray-600">
                {player.gamesPlayed} games • {(player.winRate * 100).toFixed(1)}
                % win rate
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="font-bold text-lg text-gray-900">
                {player.gamesWon}
              </p>
              <p className="text-sm text-gray-600">wins</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
