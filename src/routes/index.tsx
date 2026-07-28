import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🎮</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Games Night Manager
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              The ultimate platform for organizing epic game nights with
              real-time scoring, live controls, and seamless team management
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/join"
                className="inline-flex items-center px-8 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg text-lg border-2 border-white"
              >
                🎮 Join Session
              </Link>
              <Link
                to="/sessions/new"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                🚀 Host a Session
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center px-8 py-4 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition-all transform hover:scale-105 shadow-lg text-lg border-2 border-white"
              >
                📋 My Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Showcase */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Game Night
            </h2>
            <p className="text-xl text-gray-600">
              Professional-grade tools for running unforgettable gaming sessions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Live Game Control */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Live Game Control
              </h3>
              <p className="text-gray-600 mb-4">
                Control games in real-time with pause/resume, round management,
                and turn-based gameplay. Perfect for running smooth game nights.
              </p>
              <Link
                to="/games"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Explore Games →
              </Link>
            </div>

            {/* Feature 2: Real-time Scoring */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Real-time Scoring
              </h3>
              <p className="text-gray-600 mb-4">
                Track scores round-by-round with live leaderboards that update
                instantly. Everyone sees the action as it happens via WebSocket.
              </p>
              <Link
                to="/scoring"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                See Scoring →
              </Link>
            </div>

            {/* Feature 3: GM Dashboard */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                GM Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor all your sessions, track active games, and see player
                activity from one powerful dashboard with real-time updates.
              </p>
              <Link
                to="/sessions"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                View Sessions →
              </Link>
            </div>

            {/* Feature 4: Team Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-orange-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Team Formation
              </h3>
              <p className="text-gray-600 mb-4">
                Automatically create balanced teams or manually assign players.
                Perfect for competitive matches and fair gameplay.
              </p>
              <Link
                to="/teams"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Manage Teams →
              </Link>
            </div>

            {/* Feature 5: Session Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-pink-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Session Management
              </h3>
              <p className="text-gray-600 mb-4">
                Create sessions, share join codes, and manage everything from
                player check-ins to game queues all in one place.
              </p>
              <Link
                to="/sessions"
                className="text-pink-600 hover:text-pink-700 font-semibold"
              >
                Browse Sessions →
              </Link>
            </div>

            {/* Feature 6: Live Player View */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-indigo-500 hover:shadow-2xl transition-shadow">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Live Player View
              </h3>
              <p className="text-gray-600 mb-4">
                Beautiful spectator view for players to watch scores update
                live. Perfect for casting to TVs during game night!
              </p>
              <div className="text-indigo-600 font-semibold">
                Auto-updates with WebSocket ✨
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Getting Started is Easy
            </h2>
            <p className="text-xl text-gray-600">
              Set up your first game night in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create Session
              </h3>
              <p className="text-gray-600">
                Set up your gaming session with date, location, and games
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Invite Players
              </h3>
              <p className="text-gray-600">
                Share the join code and players join instantly with their
                devices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Form Teams
              </h3>
              <p className="text-gray-600">
                Auto-create balanced teams or manually assign players
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Play & Score
              </h3>
              <p className="text-gray-600">
                Use live controls to manage games and track scores in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Level Up Your Game Night?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join game nights run by hosts who use professional tools for
            seamless gameplay
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/sessions/new"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              🎮 Host a Game Night
            </Link>
            <Link
              to="/join"
              className="inline-flex items-center px-8 py-4 bg-indigo-800 text-white font-bold rounded-lg hover:bg-indigo-900 transition-all transform hover:scale-105 shadow-lg text-lg border-2 border-white"
            >
              🎯 Join with Code
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            Built with ❤️ for game night enthusiasts • Real-time powered by
            WebSocket
          </p>
        </div>
      </div>
    </div>
  )
}
