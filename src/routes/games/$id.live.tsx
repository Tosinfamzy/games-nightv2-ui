import { createFileRoute } from '@tanstack/react-router';
import { LiveLeaderboard, RoundScorecard } from '../../components/game-control';
import { useGameControl } from '../../hooks/useGameControl';
import GameTimer from '../../components/GameTimer';

function LiveGameViewPage() {
  const { id } = Route.useParams();
  const { game, isLoading } = useGameControl(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-2xl font-bold mb-2">Game Not Found</div>
          <div className="text-gray-300">The game you're looking for doesn't exist</div>
        </div>
      </div>
    );
  }

  const isGameActive = game.status === 'IN_PROGRESS';
  const isGameCompleted = game.status === 'COMPLETED';
  const progress = game.maxRounds > 0 ? (game.currentRound / game.maxRounds) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Game Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 text-white border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
              {game.description && (
                <p className="text-white/80 text-lg">{game.description}</p>
              )}
            </div>
            <div className="text-right">
              <div
                className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                  isGameActive
                    ? 'bg-green-500 text-white'
                    : isGameCompleted
                      ? 'bg-gray-500 text-white'
                      : 'bg-blue-500 text-white'
                }`}
              >
                {game.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Round Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 font-medium">
                Round {game.currentRound} of {game.maxRounds}
              </span>
              <span className="text-2xl font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  isGameCompleted
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-blue-400 to-purple-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Game Timer (if applicable) */}
        {isGameActive && (
          <div className="mb-6">
            <GameTimer gameId={id} showTeamName size="lg" />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <LiveLeaderboard gameId={id} showRoundBreakdown />
          </div>

          {/* Round Scorecard */}
          <div className="lg:col-span-1">
            <RoundScorecard gameId={id} />
          </div>
        </div>

        {/* Winner Announcement */}
        {isGameCompleted && (
          <div className="mt-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-8 text-center border-4 border-yellow-300 shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-4xl font-bold text-white mb-2">Game Complete!</h2>
            <p className="text-white/90 text-xl">Check the leaderboard to see the final results</p>
          </div>
        )}

        {/* Live Indicator */}
        {isGameActive && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="font-bold">LIVE</span>
          </div>
        )}

        {/* Auto-refresh Notice */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>🔄 This page updates automatically in real-time</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/games/$id/live')({
  component: LiveGameViewPage,
});
