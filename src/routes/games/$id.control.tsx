import { Link, createFileRoute } from '@tanstack/react-router';
import {
  GameControlPanel,
  RoundManager,
  TurnController,
  LiveScoreEntry,
  LiveLeaderboard,
} from '../../components/game-control';

function GameControlPage() {
  const { id } = Route.useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/games/$id"
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
            Back to Game Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Game Control Panel</h1>
          <p className="text-gray-600 mt-1">
            Manage your game in real-time: control rounds, turns, and scoring
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Game Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Control Panel */}
            <GameControlPanel gameId={id} />

            {/* Round Manager */}
            <RoundManager gameId={id} />

            {/* Turn Controller */}
            <TurnController gameId={id} />

            {/* Quick Score Entry */}
            <LiveScoreEntry gameId={id} />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <LiveLeaderboard gameId={id} showRoundBreakdown />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/games/$id/score"
              params={{ id }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📊 Score Entry View
            </Link>
            <Link
              to="/games/$id/live"
              params={{ id }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              📺 Live Player View
            </Link>
            <Link
              to="/games/$id"
              params={{ id }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📋 Game Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/games/$id/control')({
  component: GameControlPage,
});
