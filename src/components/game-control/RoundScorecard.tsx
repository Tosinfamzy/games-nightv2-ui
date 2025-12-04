import { useGameControl } from '../../hooks/useGameControl';
import { useGameScoring } from '../../hooks/useGameScoring';
import type { UUID } from '../../lib/api/types';

interface RoundScorecardProps {
  gameId: UUID;
  className?: string;
}

export default function RoundScorecard({ gameId, className = '' }: RoundScorecardProps) {
  const { game, isLoading: isLoadingGame } = useGameControl(gameId);
  const { teamScores, isLoading: isLoadingScores } = useGameScoring(gameId);

  if (isLoadingGame || isLoadingScores) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Get all rounds (1 to maxRounds or currentRound, whichever is greater)
  const totalRounds = Math.max(game.maxRounds, game.currentRound);
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">📊 Round Scorecard</h3>
        <p className="text-sm text-gray-600">
          Round-by-round breakdown for all teams
        </p>
      </div>

      {teamScores.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No scores recorded yet</p>
          <p className="text-sm mt-1">Scores will appear here after entry</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-3 font-bold text-gray-900 sticky left-0 bg-white z-10">
                  Team
                </th>
                {rounds.map((round) => (
                  <th
                    key={round}
                    className={`text-center p-3 font-bold min-w-[60px] ${
                      round === game.currentRound
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">R{round}</div>
                    {round === game.currentRound && (
                      <div className="text-[10px] text-blue-600 font-normal">CURRENT</div>
                    )}
                  </th>
                ))}
                <th className="text-center p-3 font-bold text-gray-900 bg-gray-50 min-w-[80px]">
                  <div className="text-xs text-gray-600 mb-1">TOTAL</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {teamScores.map((team, index) => {
                const isFirst = index === 0;

                return (
                  <tr
                    key={team.teamId}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      isFirst ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                    }`}
                  >
                    {/* Team Name */}
                    <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        {isFirst && <span className="text-lg">🥇</span>}
                        <span>{team.teamName}</span>
                      </div>
                    </td>

                    {/* Round Scores */}
                    {rounds.map((round) => {
                      const roundScore = team.roundPoints[round] || 0;
                      const hasScore = team.roundPoints[round] !== undefined;

                      return (
                        <td
                          key={round}
                          className={`text-center p-3 ${
                            round === game.currentRound ? 'bg-blue-50' : ''
                          }`}
                        >
                          {hasScore ? (
                            <span
                              className={`font-medium ${
                                roundScore > 0
                                  ? 'text-green-600'
                                  : roundScore < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {roundScore > 0 ? `+${roundScore}` : roundScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="text-center p-3 font-bold text-gray-900 bg-gray-50">
                      <div className="text-lg">{team.totalPoints}</div>
                      {team.bonusPointsCount > 0 && (
                        <div className="text-[10px] text-blue-600">
                          +{team.bonusPointsCount} bonus
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {teamScores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Current Round</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>Leading Team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">+X</span>
            <span>Points Gained</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium">-X</span>
            <span>Points Lost</span>
          </div>
        </div>
      )}
    </div>
  );
}
