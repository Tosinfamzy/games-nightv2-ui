import { Link, createFileRoute } from '@tanstack/react-router';
import {
  LiveScoreEntry,
  RoundScorecard,
  LiveLeaderboard,
} from '../../components/game-control';
import { useGameControl } from '../../hooks/useGameControl';

function ScoreEntryPage() {
  const { id } = Route.useParams();
  const { game, isLoading } = useGameControl(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/games/$id/control"
            params={{ id }}
            className="text-blue-500 hover:text-blue-600 inline-flex items-center mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Control Panel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Score Entry</h1>
              <p className="text-gray-600 mt-1">
                {game?.name || 'Loading...'} • Round {game?.currentRound || 0} of{' '}
                {game?.maxRounds || 0}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {game?.maxRounds && game?.currentRound
                  ? Math.round((game.currentRound / game.maxRounds) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Score Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Score Entry */}
            <LiveScoreEntry gameId={id} />

            {/* Round Scorecard */}
            <RoundScorecard gameId={id} />
          </div>

          {/* Right Column - Live Leaderboard */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <LiveLeaderboard gameId={id} showRoundBreakdown />

              {/* Game Status Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Game Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        game?.status === 'IN_PROGRESS'
                          ? 'text-green-600'
                          : game?.status === 'COMPLETED'
                            ? 'text-gray-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {game?.status.replace('_', ' ') || 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teams:</span>
                    <span className="font-medium text-gray-900">
                      {game?.teams.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Players:</span>
                    <span className="font-medium text-gray-900">
                      {game?.teams.reduce(
                        (total, team) => total + team.playerIds.length,
                        0
                      ) || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to="/games/$id/control"
                    params={{ id }}
                    className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-sm font-medium"
                  >
                    🎮 Game Controls
                  </Link>
                  <Link
                    to="/games/$id/live"
                    params={{ id }}
                    className="block w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center text-sm font-medium"
                  >
                    📺 Live View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/games/$id/score')({
  component: ScoreEntryPage,
});
