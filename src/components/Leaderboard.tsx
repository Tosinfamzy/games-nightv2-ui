import { useLeaderboard } from '../hooks/useGameHistory'
import { LeaderboardSkeleton } from './LoadingSkeleton'
import EmptyState from './EmptyState'

interface LeaderboardProps {
  limit?: number
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const { data: players, isLoading, error } = useLeaderboard(limit)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Top Players</h3>
        <LeaderboardSkeleton count={5} />
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
        <EmptyState
          icon={<span>🏆</span>}
          title="No champions yet"
          description="Play some games to start building your leaderboard! The top performers will appear here."
          size="sm"
        />
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
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors stagger-item"
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
