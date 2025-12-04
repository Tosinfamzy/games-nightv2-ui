import { useGameControl } from '../../hooks/useGameControl';
import type { UUID } from '../../lib/api/types';

interface TurnControllerProps {
  gameId: UUID;
  className?: string;
}

export default function TurnController({ gameId, className = '' }: TurnControllerProps) {
  const { game, isLoading, nextTurn, isAdvancingTurn } = useGameControl(gameId);

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const isInProgress = game.status === 'IN_PROGRESS';
  const currentTeamIndex = game.teams.findIndex((t) => t.id === game.teams[0]?.id);
  const currentTeam = game.teams[currentTeamIndex];
  const nextTeamIndex = (currentTeamIndex + 1) % game.teams.length;
  const nextTeamName = game.teams[nextTeamIndex]?.name;

  // Check if game uses turn-based mechanics
  const hasTurnBasedMechanics = game.teams.length > 1;

  if (!hasTurnBasedMechanics) {
    return null; // Don't show turn controller for single-team or non-turn-based games
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Turn Management</h3>

        {isInProgress ? (
          <div>
            {/* Current Turn Display */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">CURRENT TURN</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {currentTeam?.name || 'No team'}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {currentTeam?.playerIds.length || 0} player
                    {currentTeam?.playerIds.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </div>

            {/* Next Team Preview */}
            {nextTeamName && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">NEXT UP</div>
                <div className="text-lg font-medium text-gray-900">{nextTeamName}</div>
              </div>
            )}

            {/* Team Order Display */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-2">TURN ORDER</div>
              <div className="flex flex-wrap gap-2">
                {game.teams.map((team, index) => (
                  <div
                    key={team.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index === currentTeamIndex
                        ? 'bg-blue-500 text-white'
                        : index === nextTeamIndex
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {team.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Turn Button */}
            <button
              onClick={() => nextTurn()}
              disabled={isAdvancingTurn}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAdvancingTurn
                ? 'Advancing Turn...'
                : `➡️ Next Turn (${nextTeamName})`}
            </button>

            {/* Keyboard Shortcut Hint */}
            <div className="mt-3 text-center text-xs text-gray-500">
              Tip: Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">N</kbd> for next turn
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">Turn management available when game is in progress</p>
          </div>
        )}
      </div>

      {/* Stats */}
      {isInProgress && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{game.teams.length}</div>
              <div className="text-xs text-gray-600">Total Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {game.teams.reduce((total, team) => total + team.playerIds.length, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Players</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
