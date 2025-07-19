import { Link, createFileRoute } from '@tanstack/react-router'

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Games Night
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Organize and track your game sessions with friends
        </p>

        <div className="mb-6 text-center space-x-4">
          <Link
            to="/demo"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            🚀 Try Demo (Test Join Flow)
          </Link>
          <Link
            to="/flow-demo"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            🔄 Complete Flow Demo
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/sessions/new"
            className="p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-green-200"
          >
            <h2 className="text-2xl font-semibold text-green-900 mb-2">
              🏠 Host Session
            </h2>
            <p className="text-green-700">
              Create a new game session and get a join code
            </p>
          </Link>

          <Link
            to="/join"
            className="p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-200"
          >
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">
              🎮 Join Session
            </h2>
            <p className="text-blue-700">
              Enter a session code to join an active game
            </p>
          </Link>

          <Link
            to="/sessions"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Game Sessions
            </h2>
            <p className="text-gray-600">
              Create and manage your game sessions
            </p>
          </Link>

          <Link
            to="/games"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Active Games
            </h2>
            <p className="text-gray-600">View and manage your ongoing games</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
