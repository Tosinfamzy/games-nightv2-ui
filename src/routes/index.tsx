import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Games Night Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organize gaming sessions, manage players, create teams, and track
            scores all in one place
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            to="/sessions"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sessions
            </h3>
            <p className="text-gray-600 text-sm">
              Create and manage gaming sessions
            </p>
          </Link>

          <Link
            to="/players"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Players
            </h3>
            <p className="text-gray-600 text-sm">
              Manage player profiles and participation
            </p>
          </Link>

          <Link
            to="/teams"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teams</h3>
            <p className="text-gray-600 text-sm">
              Create and organize teams for games
            </p>
          </Link>

          <Link
            to="/games"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-3xl mb-4">🎲</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Games</h3>
            <p className="text-gray-600 text-sm">
              Browse and manage your game library
            </p>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Management
              </h3>
              <p className="text-gray-600">
                Create sessions, invite players with join codes, and manage the
                entire gaming experience
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Team Formation
              </h3>
              <p className="text-gray-600">
                Automatically or manually create balanced teams for competitive
                gameplay
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Score Tracking
              </h3>
              <p className="text-gray-600">
                Keep track of scores, rounds, and determine winners with
                built-in scoring systems
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">
                  Create a Session
                </h4>
                <p className="text-gray-600 text-sm">
                  Set up a new gaming session with date, location, and details
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Invite Players</h4>
                <p className="text-gray-600 text-sm">
                  Share the join code with friends so they can join your session
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Start Playing</h4>
                <p className="text-gray-600 text-sm">
                  Organize teams, track scores, and enjoy your games!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/sessions/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Create Your First Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
