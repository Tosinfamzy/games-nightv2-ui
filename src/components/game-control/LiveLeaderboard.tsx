import { useGameScoring } from '../../hooks/useGameScoring';
import type { UUID } from '../../lib/api/types';

interface LiveLeaderboardProps {
  gameId: UUID;
  className?: string;
  showRoundBreakdown?: boolean;
}

export default function LiveLeaderboard({
  gameId,
  className = '',
  showRoundBreakdown = false,
}: LiveLeaderboardProps) {
  const { leaderboard, winner, isLoading } = useGameScoring(gameId);

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Leaderboard</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No scores yet</p>
          <p className="text-sm mt-1">Start entering scores to see the leaderboard</p>
        </div>
      </div>
    );
  }

  const maxScore = leaderboard[0]?.totalPoints || 1;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">🏆 Leaderboard</h3>
        {winner && (
          <p className="text-sm text-green-600 font-medium">
            Leading: {winner.teamName}
          </p>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((team, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;
          const percentage = maxScore > 0 ? (team.totalPoints / maxScore) * 100 : 0;

          return (
            <div
              key={team.teamId}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                isFirst
                  ? 'border-yellow-400 bg-yellow-50'
                  : isSecond
                    ? 'border-gray-400 bg-gray-50'
                    : isThird
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white'
              }`}
            >
              {/* Progress Bar Background */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  isFirst
                    ? 'bg-yellow-200'
                    : isSecond
                      ? 'bg-gray-200'
                      : isThird
                        ? 'bg-orange-200'
                        : 'bg-blue-100'
                }`}
                style={{ width: `${percentage}%`, opacity: 0.3 }}
              ></div>

              {/* Content */}
              <div className="relative p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Rank */}
                  <div
                    className={`text-2xl font-bold ${
                      isFirst
                        ? 'text-yellow-600'
                        : isSecond
                          ? 'text-gray-600'
                          : isThird
                            ? 'text-orange-600'
                            : 'text-gray-500'
                    }`}
                  >
                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${team.rank}.`}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {team.teamName}
                      {team.isTied && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          TIED
                        </span>
                      )}
                    </div>
                    {showRoundBreakdown && Object.keys(team.roundPoints).length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {Object.entries(team.roundPoints)
                          .map(([round, points]) => `R${round}: ${points}`)
                          .join(' • ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {team.totalPoints}
                  </div>
                  <div className="text-xs text-gray-600">points</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-gray-900">
                {leaderboard[0].totalPoints - (leaderboard[1]?.totalPoints || 0)}
              </div>
              <div className="text-gray-600 text-xs">Point Lead</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">{leaderboard.length}</div>
              <div className="text-gray-600 text-xs">Teams</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
